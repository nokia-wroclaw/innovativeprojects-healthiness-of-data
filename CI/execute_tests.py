import os
import paramiko

print("Test execution on {}".format(os.environ["DROPLET_IP"]))

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
clone_command="git clone -b {} https://github.com/nokia-wroclaw/innovativeprojects-healthiness-of-data.git 2>&1"
testing_command="./innovativeprojects-healthiness-of-data/CI/testing.sh 2>&1"
if(os.environ["TRAVIS_PULL_REQUEST_BRANCH"]):
    clone_command = clone_command.format(os.environ["TRAVIS_PULL_REQUEST_BRANCH"])
else:
    clone_command = clone_command.format(os.environ["TRAVIS_BRANCH"])
client.connect(os.environ["DROPLET_IP"], username="ci", password=os.environ["SSH_PASSWORD"], look_for_keys=False)
#workaround
client.exec_command('rm -fr innovativeprojects-healthiness-of-data/')
stdin, stdout, stderr = client.exec_command(clone_command)
for i in stdout.read().splitlines():
    print(i)
stdin, stdout, stderr = client.exec_command(testing_command)
for i in stdout.read().splitlines():
    print(i)
