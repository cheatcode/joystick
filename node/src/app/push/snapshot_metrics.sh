#!/bin/sh
free -m | awk 'NR==2{printf "{ \"memory\": \"%.2f%%\",", $3*100/$2 }'
printf " \"cpu\": \"$(awk -v a="$(awk '/cpu /{print $2+$4,$2+$4+$5}' /proc/stat; sleep 1)" '/cpu /{split(a,b," "); print 100*($2+$4-b[1])/($2+$4+$5-b[2])}'  /proc/stat)%%\", "
df -h | awk '$NF=="/"{printf "\"disk\": \"%s\" }", $5}'