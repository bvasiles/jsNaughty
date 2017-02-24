#!/bin/bash
#set -u
#set -e
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
path="${__dir}"
script="${path}/lmServer.py"
echo $script
nohup sudo python $script > ${path}/lm.out 2> ${path}/lm.err&
EXIT_CODE=$?
ps -p $! > /dev/null
if [ $? -eq 0 ]; then
  echo $! > "${path}/lm.pid"
  echo "Process forked, pid: $!"
else
  echo "Failed to start lm"
  exit 1
fi
exit $EXIT_CODE
