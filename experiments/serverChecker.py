'''
Created on Mar 4, 2017

@author: caseycas

Run and very so often ~ 5 min, check if moses servers, the language model
server, and the webserver are online.

'''
import time
import sys
import os
import subprocess
import argparse
PIPE = subprocess.PIPE
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from tools import MosesProxy
from serverManagementFunctions import *

parser = argparse.ArgumentParser(description="Daemon to check if jsnaughty servers have gone down and restart them if so.") 
parser.add_argument("-base_url",help = "The url base where the moses servers are being hosted.",
                    action="store", type=str, default = "http://godeep.cs.ucdavis.edu")
parser.add_argument("-moses_dir", help = "The directory where moses is stored.",
                    action="store", type=str, default = "/home/ccasal/moses_alt/bin/mosesserver")

args = parser.parse_args()

base_url = args.base_url
moses_loc = args.moses_dir
    
proxy = MosesProxy()
moses_ports = proxy.portLists["web"]
moses_inis = proxy.iniFiles["web-pruned"]
moses_url_dict = {}

moses_commands = []

checkTime = 60*5 #Check every 5 minutes?
script_files = ["./restartMosesServers.sh"]

#Moses Servers
for i in range(0, len(moses_ports)):
    port_num = moses_ports[i]
    ini_file = moses_inis[i]
    moses_url_dict[port_num] = base_url + ":" + str(port_num) + "/RPC2"
 
    moses_commands.append("nohup " + moses_loc + " --server-port " + 
                 str(port_num) + " --server-log server" + str(port_num) + ".log --minphr-memory "
                 + "--minlexr-memory -f " + str(ini_file)
                 + " -search-algorithm 1 -cube-pruning-pop-limit 2000 -s 2000 -n-best-list - 10&")

#    moses_commands.append("nohup /home/ccasal/moses2/bin/moses2  --server --server-port " +
#                str(port_num) + " --server-log server" + str(port_num) + ".log --minphr-memory "
#                + "--minlexr-memory -f " + str(ini_file)
#                + " -search-algorithm 1 -cube-pruning-pop-limit 2000 -s 2000 -n-best-list - 10&")



#Create a shell script to restart the servers.
#This simple one kills any moses servers running under the users processes and restarts them
#when they go down.
with open(script_files[0], "w") as f:
    f.write("pkill mosesserver\n")
    #f.write("pkill moses2\n")
    for command in moses_commands:
        f.write(command + "\n")

print(moses_ports)
print(moses_inis)
print(moses_url_dict)
#quit()

 
#Apache server
#TODO


#Lm servers
#TODO
restart_attempt = False
while(True):
    mosesFail = False
    #Ping moses Servers
    print("Checking server status.")
    mosesStatus = checkMosesServers(moses_url_dict) #Eventually turn into list of failed servers
    #Do a simple kill and restart for the moment (can change to something more selective later).
    print(mosesStatus)
    for port, status in mosesStatus.iteritems():
        if(status == "E" or status == "F"):
            mosesFail = True
            break
    print(mosesFail)
#    break
    if(mosesFail):
        if(not restart_attempt):
            #Restart servers if fail and check again in 5 minutes
            print("Restarting")
            restartServers(script_files)
            restart_attempt = True
        else:
            print("Tried to restart once, giving up.")
            #Email me and Bogdan
            break #Terminate...
    else:
        restart_attempt = False
    
    #Wait for awhile
    time.sleep(checkTime)
