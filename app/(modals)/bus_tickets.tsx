import { ActivityIndicator, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '@/context/GlobalProvider'
import { Colors } from '@/constants/Colors'
// import Carousel from 'react-native-reanimated-carousel'
import Carousel from '@/components/Carousel'
import CustomButton from "@/components/CustomButton"
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { City } from 'country-state-city'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router'

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default function BusTicketsScreen() {

    const [dailyRoutes, setDailyRoutes] = useState<DailyRoute[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { apiCaller } = useGlobalContext()
    const cities = City.getCitiesOfCountry("IN")
    const [selectedDepPlace, setSelectedDepPlace] = useState<string>("")
    const [selectedDestPlace, setSelectedDestPlace] = useState<string>("")



    const fetchDailyRoutes = async () => {
        try {
            setIsLoading(true)
            const res = await apiCaller.get("/api/busRoute/all")
            setDailyRoutes(res.data.data)
        } catch (error: any) {
            console.log(error);
            console.log(error?.response?.data?.message);
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDailyRoutes()
    }, [])
    const filterDailyRoutes = () => {
        return dailyRoutes.filter((route) => {
            return !selectedDepPlace ? true : route.departurePlace.toLowerCase().includes(selectedDepPlace.toLowerCase()) && !selectedDestPlace ? true : route.destinationPlace.toLowerCase().includes(selectedDestPlace.toLowerCase())
        })
    }

    const filteredRoutes = selectedDepPlace || selectedDestPlace ? filterDailyRoutes() : dailyRoutes


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.curveSection}>
            <TouchableOpacity onPress={() => router.push("/favourite_bus_tickets")} style={styles.addButton}>
                <Text style={styles.addButtonText}>Favourite Routes</Text>
            </TouchableOpacity>

            <View style={styles.vehicleFilterContainer}>
                <Picker
                    selectedValue={selectedDepPlace}
                    style={styles.vehiclePicker}
                    onValueChange={item => setSelectedDepPlace(item)}
                >
                    <Picker.Item label="From" value="" style={styles.picker}/>
                    {
                        cities?.map((city) => (
                            <Picker.Item label={city.name} value={city.name}  />
                        ))
                    }
                </Picker>
            </View>

            <View style={styles.vehicleFilterContainer}>
                <Picker
                    selectedValue={selectedDestPlace}
                    style={styles.vehiclePicker}
                    onValueChange={item => setSelectedDestPlace(item)}
                >
                    <Picker.Item label="To" value="" style={styles.picker} />
                    {
                        cities?.map((city) => (
                            <Picker.Item label={city.name} value={city.name} style={styles.picker} />
                        ))
                    }
                </Picker>
            </View>
            </View>
            

            

            {isLoading ? (
                <ActivityIndicator size="large" color={Colors.darkBlue} />
            ) : (
                <ScrollView style={styles.routesList}>
                    {filteredRoutes.map((route) => (
                        <BusTicketCard route={route} />
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    )
}

function BusTicketCard({ route }: { route: DailyRoute }) {
    const [isQRModalVisible, setIsQrModalVisible] = useState<string | null>(null);
    const [isChartModalVisible, setIsChartModalVisible] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [ticketRequest, setTicketRequest] = useState({
        dateOfJourney: "",
        numberOfPeople: 0,
        passengerGender: ""
    })
    const [showDepartureDatePicker, setShowDepartureDatePicker] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(false)
    const { apiCaller, isLogged, userData } = useGlobalContext()

    const handleAddToFavourite = async (id: string) => {
        setIsLoading(true)
        try {
            const res = await apiCaller.patch(`/api/busRoute/addToFavourite?routeId=${id}`)
            Alert.alert("Success", "This route have been added to the favourites")
        } catch (error: any) {
            console.log(error?.response?.data?.message || error);
            Alert.alert("Error", error?.response?.data?.message || "Could not add to favourites")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendRequest = async () => {
        if (!ticketRequest.dateOfJourney || !ticketRequest.numberOfPeople || !ticketRequest.passengerGender) {
            return Alert.alert("Failed", "Fill all the required fields")
        }
        setIsLoading(true)
        try {
            const res = await apiCaller.post(`/api/ticketRequest?routeId=${route._id}`, ticketRequest)
            Alert.alert("Success", "Interest has been sent. Agency will connect with you")
            setIsModalOpen(false)
        } catch (error: any) {
            console.log(error?.response?.data?.message || error);
            Alert.alert("Error", error?.response?.data?.message || "Could not send interest")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    const onChangeDateOfJourney = (event: any, selectedTime?: Date) => {
        setShowDepartureDatePicker(false);
        if (selectedTime) {
            setTicketRequest({ ...ticketRequest, dateOfJourney: selectedTime });
        }
    };

    const formatDate = (date: Date | undefined) => {
        if (!date) return "";
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
    };
    return (
        <View key={route._id} style={styles.card}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ position: 'relative' }}>
                    <Carousel
                        images={route?.vehicle?.photos}
                        height={deviceWidth * 0.6}
                    />
                    <View style={styles.circle}>
                        <Text style={styles.circleText}>{route?.vehicle?.isAC ? "AC" : "Non-AC"}</Text>
                        <Text style={styles.circleText}>{route?.vehicle?.isSleeper ? "Sleeper" : "Seater"}</Text>
                        <Text style={styles.circleText}>{route?.vehicle?.number.toUpperCase()}</Text>
                    </View>
                </View>
            </View>
            <View>
             <Text
                style={{
                    fontSize: 20,
                    fontWeight: '900',
                    color: '#26355E',
                    fontFamily: 'sans-serif',
                    textTransform: 'uppercase', // This will transform the text to uppercase
                    paddingHorizontal:10
                }}
             >
                {route?.agencyName}
            </Text>
         </View>


            <View style={{ width: "100%", paddingHorizontal: 40 }}>
                {/* Departure and Arrival Labels */}
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    {/* Departure Label */}
                    <View style={{ alignItems: "flex-start" }}>
                        <Text style={{ fontWeight: "900", fontSize: 15, color:'#3086FF' }}>Departure</Text>
                    </View>

                    {/* Arrival Label */}
                    <View style={{ alignItems: "start" }}>
                        <Text style={{ fontWeight: "900", fontSize: 15, paddingRight: 8, color:'#3086FF' }}>Arrival</Text>
                    </View>
                </View>

                {/* Departure and Arrival Places with Times */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 1 }}>
                    {/* Departure Place and Time */}
                    <View style={{ alignItems: "start" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, color: "#87CEEB" }}>
                            {route?.departurePlace}
                        </Text>
                        <Text>{route.departureTime ? new Date(route.departureTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : "Time not added"}</Text>
                    </View>

                    {/* Arrow Icon */}
                    <MaterialIcons name="keyboard-double-arrow-right" size={24} color="#00008B" />

                    {/* Arrival Place and Time */}
                    <View style={{ alignItems: "start" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, color: "#87CEEB" }}>
                            {route?.destinationPlace}
                        </Text>
                        <Text style={{ marginBottom: 14 }} >{route.arrivalTime ? new Date(route.arrivalTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : "Time not added"}</Text>
                    </View>
                </View>
            </View>
          


            <Text style={styles.cardText}>
                Pick Up Point - {route?.pickupPoint}
            </Text>
            <Text style={styles.cardText}>
                Dropping Point - {route?.dropoffPoint}
            </Text>
            <Text style={styles.cardText}>
                Ticket Price - {route?.ticketFare}
            </Text>

            <View>
                <Text style={{ flex: 1, fontWeight: 'bold', paddingHorizontal:10, fontSize: 12, }}>Office Address - {route?.officeAddress} </Text>
            </View>
            <View>
                <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 12, paddingHorizontal:10, marginBottom: 4 }}>Phone Pe No - {route?.phonepeNumber} </Text>
            </View>
            <View>
                <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 12, paddingHorizontal:10, marginBottom: 4 }}>Discount - {route?.discount}% </Text>
            </View>
            <Text style={{ flex: 1, fontWeight: 'bold', paddingHorizontal:10, color: '#87CEEB' }}>Amenities:</Text>
            <View style={{
                paddingTop: 1,
                paddingBottom: 14,
                flexDirection: 'row',

            }}>

                {route?.amenities?.includes("wifi") && <Image
                    source={require('@/assets/images/wifi-icon.png')}
                    style={{ width: 30, height: 30, marginHorizontal: 5 }}
                />}
                {route?.amenities?.includes("blanket") && <Image
                    source={require('@/assets/images/blanket.png')}
                    style={{ width: 30, height: 30, marginHorizontal: 5 }}
                />}
                {route?.amenities?.includes("bottle") && <Image
                    source={require('@/assets/images/bottle.png')}
                    style={{ width: 30, height: 30, marginHorizontal: 5 }}
                />}
                {route?.amenities?.includes("charger") && <Image
                    source={require('@/assets/images/charger.png')}
                    style={{ width: 30, height: 30, marginHorizontal: 5 }}
                />}
                {route?.amenities?.includes("meal") && <Image
                    source={require('@/assets/images/meal.png')}
                    style={{ width: 30, height: 30, marginHorizontal: 5 }}
                />}
                {route?.amenities?.includes("pillow") && <Image
                    source={require('@/assets/images/pillow.png')}
                    style={{ width: 30, height: 30, marginHorizontal: 5 }}
                />}
                {route?.amenities?.includes("tv") && <Image
                    source={require('@/assets/images/tv.png')}
                    style={{ width: 30, height: 30, marginHorizontal: 5 }}
                />}
            </View>

            <View style={{ padding: 1 }}>
                {/* <PhoneNumbersList phoneNumbers={route?.mobileNumbers} /> */}
            </View>
            
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >

                <View style={{ padding: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingTop: 14 }}>
                        {/* Column for Courier Service and QR Code Button */}
                        <View style={{ alignItems: 'center' }}>
                            {route?.doesProvideCorierService ? <Text style={styles.facilityBtn}>
                                Courier Service
                            </Text> : <Text style={[styles.facilityBtn, { backgroundColor: "transparent" }]}>

                            </Text>}
                            <CustomButton
                                title="View QR Code"
                                onPress={() => setIsQrModalVisible(route._id)}
                            />
                        </View>

                        {/* Column for Train Ticket and Driver Button */}
                        <View style={{ alignItems: 'center' }}>
                            {route?.doesBookTrainTickets ? <Text style={styles.facilityBtn}>
                                Train Ticket
                            </Text> : <Text style={[styles.facilityBtn, { backgroundColor: "transparent" }]}>

                            </Text>}
                            {/* <CustomButton
                                title="View Driver"
                                onPress={() => setIsDriverModalVisible(route._id)}
                            /> */}
                        </View>

                        {/* Column for Two Wheeler Courier and Chart Button */}
                        <View style={{ alignItems: 'center' }}>
                            {route?.doesCarryTwoWheelers ? <Text style={styles.facilityBtn}>
                                Two Wheeler Courier
                            </Text> : <Text style={[styles.facilityBtn, { backgroundColor: "transparent" }]}>

                            </Text>}
                            <CustomButton
                                title="View Chart"
                                onPress={() => setIsChartModalVisible(route._id)}
                            />
                        </View>
                    </View>
                    {isLogged && <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: '#3086FF' }]}
                            onPress={() => handleAddToFavourite(route._id)}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={[styles.modalButtonText, { color: "#fff" }]}>Add To Favourite</Text>
                            )}
                        </TouchableOpacity>
                    </View>}
                    {isLogged && <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: Colors.darkBlue, marginTop: 5 }]}
                            onPress={() => setIsModalOpen(true)}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={[styles.modalButtonText, { color: "#fff" }]}>Send Interest</Text>
                            )}
                        </TouchableOpacity>
                    </View>}
                </View>
            </View>

            <Modal
                transparent={true}
                animationType='slide'
                visible={isModalOpen}
                onRequestClose={handleCloseModal}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        padding: 20,
                        borderRadius: 10,
                        width: '80%',
                    }}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={userData?.userName}
                                editable={false}
                            />
                        </View><View style={styles.inputGroup}>
                            <Text style={styles.label}>Contact</Text>
                            <TextInput
                                style={styles.input}
                                value={userData?.mobileNumber}
                                editable={false}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Number Of People</Text>
                            <TextInput
                                style={styles.input}
                                value={ticketRequest.numberOfPeople ? ticketRequest.numberOfPeople.toString() : ""}
                                onChangeText={(text) => setTicketRequest({ ...ticketRequest, numberOfPeople: Number(text) })}
                                keyboardType='numeric'
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Date Of Journey</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowDepartureDatePicker(true)}
                            >
                                <Text>{ticketRequest.dateOfJourney ? formatDate(ticketRequest.dateOfJourney) : "Select Date"}</Text>
                            </TouchableOpacity>
                            {showDepartureDatePicker && (
                                <DateTimePicker
                                    value={ticketRequest.dateOfJourney || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={onChangeDateOfJourney}
                                />
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Passenger Gender</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={ticketRequest.passengerGender}
                                    onValueChange={(itemValue) => setTicketRequest({ ...ticketRequest, passengerGender: itemValue })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Passenger Gender" value="" />
                                    <Picker.Item label={"Male"} value={"MALE"} />
                                    <Picker.Item label={"Female"} value={"FEMALE"} />
                                    <Picker.Item label={"Family"} value={"FAMILY"} />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Departure</Text>
                            <TextInput
                                style={styles.input}
                                value={route.departurePlace ? route.departurePlace : ""}
                                editable={false}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Arrival</Text>
                            <TextInput
                                style={styles.input}
                                value={route.destinationPlace ? route.destinationPlace : ""}
                                editable={false}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Departure Time</Text>
                            <TextInput
                                style={styles.input}
                                value={route.departureTime ? new Date(route.departureTime).toLocaleTimeString("en-US") : ""}
                                editable={false}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Arrival Time</Text>
                            <TextInput
                                style={styles.input}
                                value={route.arrivalTime ? new Date(route.arrivalTime).toLocaleTimeString("en-US") : ""}
                                editable={false}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bus Number</Text>
                            <TextInput
                                style={styles.input}
                                value={route?.vehicle?.number}
                                editable={false}
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: Colors.darkBlue, marginTop: 5 }]}
                            onPress={handleSendRequest}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={[styles.modalButtonText, { color: "#fff" }]}>Send Interest</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

            </Modal>

            <Modal
                transparent={true}
                visible={isQRModalVisible === route._id}
                animationType="slide"
                onRequestClose={() => setIsQrModalVisible(null)}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <View
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 10,
                            width: '80%',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ fontSize: 16, marginBottom: 10 }}>
                        </Text>
                        <Image
                            source={{ uri: route.QR }} // Replace with your QR code image URL
                            style={{ width: 200, height: 200, marginBottom: 4 }}
                        />
                        <CustomButton
                            title="Close"
                            onPress={() => setIsQrModalVisible(null)}
                        />
                    </View>
                </View>
            </Modal>

            <Modal
                transparent={true}
                visible={isChartModalVisible === route._id}
                animationType="slide"
                onRequestClose={() => setIsChartModalVisible(null)}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <View
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 10,
                            width: '80%',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ fontSize: 16, marginBottom: 10 }}>
                            Here is your chart:
                        </Text>
                        <Image
                            source={{ uri: route.seatingArrangement }} // Replace with your chart image URL
                            style={{ width: 200, height: 200, marginBottom: 4 }}
                        />
                        <CustomButton
                            title="Close"
                            onPress={() => setIsChartModalVisible(null)}
                        />
                    </View>
                </View>
            </Modal>



        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#EAEAEA",
    },
    curveSection: {
        backgroundColor:'#3086FF',
        padding: 10,
        // margin:8,
        marginBottom:10,
        borderBottomLeftRadius: 20,  // Bottom-left corner radius
        borderBottomRightRadius: 20,
    },
    picker: {
       fontSize:12,
       color:'gray'
    },
    circle: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 70,
        height: 70,
        borderRadius: 50,
        backgroundColor: '#EEDC41',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    circleText: {
        color: '#000000',
        textAlign: 'center',
        fontSize: 8,
        fontWeight: '900'
    },
    carouselImage: {
        height: deviceWidth * 0.5,
        borderRadius: 10,
        width: deviceWidth * 0.9,
    },
    notificationContainer: {
        marginVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: '#51BEEE',
        borderRadius: 5,
        padding: 10,
    },
    notificationText: {
        color: '#ffffff',
        fontSize: 16,
        textAlign: 'center',
    },
    vehicleFilterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        marginBottom: 1,
        borderColor: 'rgba(245, 245, 35, 0.8)',
        height: 35, 
        alignItems:'center',
        // paddingVertical: 5,
        margin:2
    },
    vehiclePicker: {
        flex: 1,
        marginHorizontal: 2,
        borderColor: Colors.secondary,
        borderWidth: 1,
        height: 35,
    },
    facilityBtn: {
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 5,
        backgroundColor: '#e6f2ff',
        paddingVertical: 5,
        paddingHorizontal: 6,
        borderRadius: 5,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 10,
        borderColor: Colors.secondary,
        borderWidth: 1
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: Colors.secondary,
    },
    addButton: {
        borderRadius: 8,
        padding: 8,
        paddingHorizontal: 4,
        alignItems: "center",
        marginBottom: 10,
        width: 100,
        backgroundColor: 'rgba(245, 245, 35, 0.8)',
    },
    addButtonText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "bold",
    },
    routesList: {
        flex: 1,
    },
    card: {
        backgroundColor: "#fff",
        padding:1,
        borderRadius: 5,
        borderColor:Colors.secondary,
        borderWidth:1,
        margin: 5,
        paddingHorizontal: 1,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 10,
        alignItems: "center",
        gap: 5,
    },
    editButton: {
        backgroundColor: Colors.darkBlue,
        borderRadius: 5,
        padding: 5,
    },
    editButtonText: {
        color: "#fff",
        fontSize: 12,
    },
    cardText: {
        marginBottom: 1,
        color: '#000000',
        fontWeight: "600",
        fontSize: 12,
        paddingHorizontal:10
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
    modalContent: {
        width: 300,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    modalButton: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginHorizontal: 5,
        width: "100%",
        alignItems: "center",
    },
    modalButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    overlay: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 5,
        width: "100%"
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    picker: {
        width: "100%",
        height: 40,
        borderWidth: 1,
        borderColor: Colors.secondary,
        borderRadius: 5,
    },
    input: {
        borderColor: Colors.secondary,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 35,
        justifyContent: 'center'
    },
    textarea: {
        minHeight: 50,
        maxHeight: 300,
        textAlignVertical: 'top',
        paddingTop: 10,
    },
    pickerContainer: {
        borderColor: Colors.secondary,
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },
});