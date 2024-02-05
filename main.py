import requests
import json
import logging
import subprocess
import time

logging.basicConfig(filename="ip_updater.log",
                    level="INFO",
                    format='%(asctime)s %(levelname)-4s %(message)s',)

def get_external_ip():
    ssh_command = "ssh admin@192.168.1.1 -i /home/alex/.ssh/id_rsa /sbin/ifconfig eth0 | sed -n -E 's/^.*inet addr:([0-9\\.]+).*$/\\1/p'"

    ssh_proc = subprocess.Popen(ssh_command,
                                shell=True,
                                stderr=subprocess.PIPE,
                                stdout=subprocess.PIPE)
    errs = ssh_proc.stderr.readlines()
    if len(errs) > 0:
        logging.error("Error during ssh call: \n {}".format(errs))
        raise Exception("Something went wrong during ssh")
    return ssh_proc.stdout.read().decode("utf-8").strip()


def get_ip_from_file(file_name):
    try:
        with open(file_name, 'r') as f:
            return f.readline()
    except:
        logging.info("No current IP file")
        return None

def write_ip_to_file(file_name, ip_address):
    logging.info("Writing new ip to file: {}".format(ip_address))
    with open(file_name, 'w') as f:
        f.write(ip_address)

def update_dns_record(ip_address):
    logging.info("Updating DNS record")
    url = "https://api.godaddy.com/v1/domains/organiccode.net/records/A/%40"
    headers = {"accept": "application/json", "Content-Type": "application/json",
               "Authorization": "token"}
    body = json.dumps([{"data": ip_address, "ttl": 1800}], indent=0)
    response = requests.put(url, data=body, headers=headers)
    logging.info("PUT request to godaddy returned with status {}".format(response.status_code))


if __name__ == "__main__":

    IP_FILE = "./current_ip.txt"

    current_ip = get_ip_from_file(IP_FILE)
    if current_ip is None:
        current_ip = ""

    while True:

        try:
            new_ip = get_external_ip()

            if new_ip == current_ip:
                time.sleep(60*1)
                continue

            update_dns_record(new_ip)
        except:
            logging.exception("Failed to update DNS record!")
            time.sleep(60 * 1)
            continue
        current_ip = new_ip
        write_ip_to_file(IP_FILE, current_ip)

        time.sleep(60*1)


