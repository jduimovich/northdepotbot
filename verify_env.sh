verify_env () {
name=$1
eval "val=\"\${$name}\"" 
if [ -z $val ]
then
    echo "\n" No $1 set, please set to your token to use this script
    ERROR=1
else 
    if [ $2. = "secret." ]
    then
    echo $name " (secret - hidden)"
    else
    echo $name " $val"
    fi
fi
}

echo "Verify Environment vars:" 
verify_env "APP_ID" 
verify_env "PRIVATE_KEY"  secret 
verify_env "CLIENT_ID" 
verify_env "CLIENT_SECRET"  secret 

if [ -z $ERROR ]
then
echo $0 "OK"
else
echo $0 "Some Environment Variables Missing, see log."
exit 
fi 

