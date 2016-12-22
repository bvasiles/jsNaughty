import multiprocessing
import time
import random

def do_something(i):
    x = random.randint(1, 3)
    time.sleep(x)    
    return (i, x)
    
pool = multiprocessing.Pool(processes=4)
results = pool.imap_unordered(do_something, range(50))
    
while True:
    try:
        result = results.next(timeout=1)
        print result

    except StopIteration:
        break
    
    except multiprocessing.TimeoutError:
        print "Timeout"
        

