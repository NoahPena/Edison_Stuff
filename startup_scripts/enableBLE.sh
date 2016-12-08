rfkill unblock bluetooth

sleep 1

killall bluetoothd

sleep 1

hciconfig hci0 up
