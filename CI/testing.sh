#!/bin/bash
cd innovativeprojects-healthiness-of-data/
echo "Run pylint"
for i in $(find . -name '*py'); do pylint $i|tee -a pylint.log; done
cat pylint.log|grep 'Your code has been rated at'|awk '{print $7}'|cut -f1 -d'/'|tr '\n' ' '|awk '{s+=$1}END{print "Average pylint score:",s/NR}' RS=" "
cd ~/innovativeprojects-healthiness-of-data/frontend/frontend-angular
ng test --browser ChromeHeadless 2>&1|tee -a ngTest.log

