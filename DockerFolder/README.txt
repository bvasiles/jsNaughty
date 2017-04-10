To run the performance tests in a controlled environment:
1) Install docker and docker-compose
2) In this folder run "docker-compose build"
3) Start a shell in the image with "docker run -it jsnaughty-moses"
4) Inside the shell, run "sh startServers.sh" and wait a few minutes for the
moses servers to start.
5) Run the tests with "python testing/webPerformanceTests.py -local"
