if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi
echo "Stopping forever all"
forever stopall
echo "Forever list..."
forever list
