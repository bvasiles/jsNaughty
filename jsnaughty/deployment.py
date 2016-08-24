'''
A helper script to switch from development settings to 
deployment settings.  Takes input either as on or off.
'''

import argparse
import subprocess
PIPE = subprocess.PIPE

parser = argparse.ArgumentParser()
parser.add_argument("-on", action="store_true", help = "Flag to convert the project to deployment mode, if not used, put into development mode.")

args = parser.parse_args()
#Flip between development and deployment settings.
command = []
if(args.on):
	#cp deployment settings to settings.py
    command = ["cp", "./jsnaughty/deployment_settings.py", "./jsnaughty/settings.py"]
else:
	#cp development settings to settings.py
	command = ["cp", "./jsnaughty/development_settings.py", "./jsnaughty/settings.py"]

#run command
proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
_pc = proc.communicate()