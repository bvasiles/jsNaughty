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
import urllib
import argparse
PIPE = subprocess.PIPE
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from tools import MosesProxy

def restartServers(script_files):
    '''
    Run a list of script files externally that will
    restart the servers.
    '''
    status = True
    
    # invoke the list of files.
    for script in script_files:
        proc = subprocess.Popen(["sh", script], stderr=PIPE, stdout=PIPE)
        _pc = proc.communicate()
        status &= not proc.returncode

    return status

def checkMosesServers(urls):
    '''
    Given a list of URLs, check if they are available and returning 405 code.
    Parameters:
    urls -> a dictionary of port -> url for the port.
    Returns:
    status_dict -> a dictory or port -> status (S = Success, E = Error, F = Wrong code)
    '''
    status_dict = {}
    for port, next_url in urls.iteritems():
        print(next_url)
        if(not next_url.startswith("http://")):
            next_url = "http://" + next_url
#        if(True):
        try:
            code = urllib.urlopen(next_url).getcode()
            if(code == 405):
                status_dict[port] = "S"
            else:
                status_dict[port] = "F"
        except:
            status_dict[port] = "E"
    return(status_dict)


parser = argparse.ArgumentParser(description="Daemon to check if jsnaughty servers have gone down and restart them if so.") 
parser.add_argument("-base_url",help = "The url base where the moses servers are being hosted.",
                    action="store", type=str, default = "http://godeep.cs.ucdavis.edu")
args = parser.parse_args()

base_url = args.base_url

    
proxy = MosesProxy()
moses_ports = proxy.portLists["web"]
moses_inis = proxy.iniFiles["web"]
moses_url_dict = {}

moses_commands = []

checkTime = 60*5 #Check every 5 minutes?
script_files = ["./restartMosesServers.sh"]

#Moses Servers
for i in range(0, len(moses_ports)):
    port_num = moses_ports[i]
    ini_file = moses_inis[i]
    moses_url_dict[port_num] = base_url + ":" + str(port_num) + "/RPC2"
 
    moses_commands.append("nohup /home/ccasal/moses_alt/bin/mosesserver --server-port " + 
                 str(port_num) + " --server-log server" + str(port_num) + ".log --minphr-memory "
                 + "--minlexr-memory -f " + str(ini_file)
                 + " -search-algorithm 1 -cube-pruning-pop-limit 2000 -s 2000 -n-best-list - 10&")



#Create a shell script to restart the servers.
#This simple one kills any moses servers running under the users processes and restarts them
#when they go down.
with open(script_files[0], "w") as f:
    f.write("pkill mosesserver\n")
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
