/*
The default timeout is 5000ms on async tests.
Because we npm install and remove directories, tests can take time to run.
Setting to 3 minutes to support slow machines.
*/
jest.setTimeout(180000);
