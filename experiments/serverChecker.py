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
    
proxy = MosesProxy()
moses_ports = proxy.portLists["web"]
moses_inis = proxy.iniFiles["web"]

moses_commands = []

checkTime = 60*5 #Check every 5 minutes?
script_files = ["./restartMosesServers.sh"]

#Moses Servers
for i in range(0, len(moses_ports)):
    port_num = moses_ports[i]
    ini_file = moses_inis[i]
    moses_commands.append("nohup /home/ccasal/moses_alt/bin/mosesserver --server-port " + 
                 port_num + " --server-log server" + port_num +".log --minphr-memory --minlexr-memory"
                 + " -f " + ini_file +
                  + " -search-algorithm 1 -cube-pruning-pop-limit 2000 -s 2000 -n-best-list - 10&")



#Create a shell script to restart the servers.
with open(script_files[0], "w") as f:
    for command in moses_commands:
        f.write(command + "\n")
        
#Apache server
#TODO


#Lm servers
#TODO

restart_attempt = False
while(True):
    #Ping moses Servers
    mosesFail = False #Eventually turn into list of failed servers
    if(mosesFail):
        if(not restart_attempt):
            #Restart servers if fail and check again in 5 minutes
            print("Restarting")
            restartServers(script_files)
            restart_attempt = True
        else:
            #Email me and Bogdan
            break #Terminate...
    else:
        restart_attempt = False
    
    #Wait for awhile
    time.sleep(checkTime)
