import {StatusBar} from 'expo-status-bar';
import {Button, Image, SafeAreaView, StyleSheet, Text, View} from 'react-native';

import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

export default function App() {
    const BACKEND_IP = '192.168.0.113'
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([]);
    const [details, setDetails] = useState({})

    const [running, setRunning] = useState(false)

    useEffect(()=>{
        let cron = null
        if (running){
            cron = setInterval(() => {
                cronFunc()

            }, 2000)
        } else {
            clearInterval(cron)
        }
        return () => clearInterval(cron)
    }, [running])

    function fetchNames(){
        fetch(`http://${BACKEND_IP}:4000/api/collections/nft-get-collection-names`)
            .then(res => {
                console.log(res)
                return res.json()
            })
            .then(data => setItems([...new Set(data.map(item => {
                    console.log(item)
                    return ({
                        label: item.name,
                        value: item.slug,
                    })
                }
            ))]))
            .catch(err => console.log(err))
    }

    function fetchCollection(){
        fetch(`http://${BACKEND_IP}:4000/api/collections/nft-get-by-slug`,
            {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer',
                body: JSON.stringify({slug: value}),
            }
            )
            .then(res => res.json())
            .then((data) => setDetails(data[0]))
            .catch(err => console.log(err))
    }

    useEffect(() => {
        fetchNames()
    }, []);

    const cronFunc = () => {
        console.log('cron is running')
        fetchCollection()

    }

    const handleMonitoring = () => {
        console.log('You selected: ',value);
        fetchCollection()
        setRunning(true)
    };

    const stopMonitoring = () => {

        // clearInterval(cron)
        // cron = null;
        // console.log('stop cron!')
        setRunning(false)
        setValue(null)
        setDetails({})
    }

    return (
        <SafeAreaView>
            <View style={{alignItems: 'center'}}>
                <Text style={{marginTop: 50}}>Start monitoring you collection!</Text>
                <Text style={{color: 'red', marginBottom: 50}}>Please pick an option:</Text>
                {value && (
                    <View>
                    <Button title={'Start'} onPress={handleMonitoring}/>
                    <Button title={'Stop'} onPress={stopMonitoring}/>
                    </View>
                )}
                {/*<Button title={'Get titles'} onPress={fetchNames}/>*/}
                <View style={{width: '70%', marginTop: 50}}>
                    <DropDownPicker
                        open={open}
                        value={value}
                        items={items}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setItems}
                    />
                </View>
                {
                    Object.keys(details).length > 0 && (
                        <View style={{width: '70%', marginTop: 50}}>
                            <Image style={styles.tinyLogo} source={{ uri: details.image_url}}/>
                            <Text>{details.name}</Text>
                            <Text>{details._id}</Text>
                            <Text>{details.total_volume}</Text>
                            <Text>{details.average_price}</Text>
                            <Text>{details.floor_price}</Text>
                            <Text>{details.one_hour_difference}</Text>
                            <Text>{details.date}</Text>

                        </View>
                    )
                }
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tinyLogo: {
        width: 50,
        height: 50,
    },
});
