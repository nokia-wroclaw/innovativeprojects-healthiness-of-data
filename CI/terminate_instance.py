import os
from digitalocean import Manager, Droplet

connection = Manager(token=os.environ["DO_TOKEN"])
droplets = connection.get_all_droplets()
for i in droplets:
    if i.name == os.environ["TRAVIS_COMMIT"]:
        droplet = i
droplet.destroy()