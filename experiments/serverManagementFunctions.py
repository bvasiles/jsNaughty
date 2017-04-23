import subprocess
import urllib
import argparse
PIPE = subprocess.PIPE

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

def checkMosesServers(urls, debug = False):
    '''
    Given a list of URLs, check if they are available and returning 405 code.
    Parameters:
    urls -> a dictionary of port -> url for the port.
    Returns:
    status_dict -> a dictory or port -> status (S = Success, E = Error, F = Wrong code)
    '''
    status_dict = {}
    for port, next_url in urls.iteritems():
        if(debug==True):
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
