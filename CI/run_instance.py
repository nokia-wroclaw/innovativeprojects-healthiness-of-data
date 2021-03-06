import os
from digitalocean import Manager, Droplet
from time import sleep
from time import time
import paramiko

connection = Manager(token=os.environ["DO_TOKEN"])
key = []
key.append(connection.get_ssh_key("18830428"))
for i in connection.get_my_images():
    if i.name == os.environ["IMAGE_NAME"]:
        image = connection.get_image(i.id).id
        break
srv = Droplet(token=os.environ["DO_TOKEN"], image=image, size="s-1vcpu-1gb", region="fra1", ssh_keys=key, \
              name=os.environ["TRAVIS_COMMIT"], user_data="#!/bin/bash\nsed -i 's%PasswordAuthentication no%PasswordAuthentication yes%g' /etc/ssh/sshd_config\nservice sshd restart\n")
start = time()
srv.create()
for i in range(1,12):
    if srv.get_actions()[0].status == 'completed':
        stop = time()
        print("Instance provisioninng took {}. Saving envs to run_instance_envs.".format(stop-start))
        start = time()
        ip_addr = Droplet.get_object(api_token=os.environ["DO_TOKEN"], droplet_id=srv.id).ip_address
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        while(True):
            try:
                client.connect(ip_addr, username="ci", password=os.environ["SSH_PASSWORD"],
                               look_for_keys=False)
                stdin, stdout, stderr = client.exec_command('ls -la')
                break
            except:
                sleep(3)
                pass
            if(time()-start>120):
                print("Instance creation fail")
                exit(2)
        print(ip_addr)
        f=open("run_instance_envs", 'w')
        f.write("export DROPLET_IP={}".format(ip_addr))
        f.close()
        exit(0)
    else:
        sleep(10)
exit(1)


