import stun

def get_external_ip():
    nat_type, external_ip, external_port = stun.get_ip_info()
    return external_ip