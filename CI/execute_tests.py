import os
import paramiko

print("Test execution on {}".format(os.environ["DROPLET_IP"]))

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(os.environ["DROPLET_IP"], username="ci", password=os.environ["SSH_PASSWORD"], look_for_keys=False)
stdin, stdout, stderr = client.exec_command('ls -la')
for i in stdout.read().splitlines():
    print(i)