FROM python:alpine3.19

RUN pip3 install requests
RUN pip3 install pystun3
COPY . /app

WORKDIR /app
CMD python main.py