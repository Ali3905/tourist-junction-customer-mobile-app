import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    SafeAreaView,
    ScrollView,
    Image,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
} from "react-native";
// import PagerView from "react-native-pager-view";
import { FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";
// import { BlurView } from 'expo-blur';
import { Picker } from "@react-native-picker/picker";
import { City, State } from "country-state-city";
import Carousel from "@/components/Carousel";

const { width: viewportWidth } = Dimensions.get("window");
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

interface Vehicle {
    _id: string;
    number: string;
    seatingCapacity: number;
    model: string;
    bodyType: string;
    chassisBrand: string;
    location: string;
    contactNumber: string;
    photos: string[];
    isAC: boolean;
    isForRent: boolean;
    isForSell: boolean;
    type: string;
    curtain?: boolean;
    isLuggageSpace?: boolean;
    isSeatPushBack?: boolean;
    amenities?: string[];
}

interface BlurOverlayProps {
    visible: boolean;
    onRequestClose: () => void;
}

const BlurOverlay: React.FC<BlurOverlayProps> = ({ visible, onRequestClose }) => (
    <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onRequestClose}
    >
        <TouchableOpacity activeOpacity={1} onPress={onRequestClose} style={styles.overlay}>
            {/* <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} /> */}
        </TouchableOpacity>
    </Modal>
);

const RentVehicleScreen: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])

    const [activeSlide, setActiveSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const { apiCaller } = useGlobalContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState("")
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState<string>("PB")
    const [selectedCity, setSelectedCity] = useState<string>("")

    const states = State.getStatesOfCountry("IN")
    const cities = City.getCitiesOfState("IN", selectedState)

    const renderPagerItem = (item: string, index: number) => {
        return (
            <TouchableOpacity activeOpacity={1} style={styles.carouselItem} key={index} onPress={() => handleViewImage(item)}>
                <Image source={{ uri: item }} style={styles.carouselImage} />
            </TouchableOpacity>
        );
    };

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await apiCaller.get('/api/vehicle/purpose/RENT/');
            const filteredData = response.data.data.filter((vehicle: Vehicle) => {
                return vehicle.isForRent === true
            })
            setVehicles(filteredData);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };



    const filterVehicles = () => {
        return vehicles.filter((vehicle) => {
            return (vehicleTypeFilter === "" ? true : vehicle.type === vehicleTypeFilter) && (selectedCity === "" ? true : vehicle.location.toLowerCase().includes(selectedCity.toLowerCase()))
        });
    };

    const handleViewImage = (imageUri: string) => {
        setSelectedImage(imageUri);
        setShowImageModal(true);
    };

    // const filteredVehicles = (vehicleTypeFilter || selectedCity) ? filterVehicles() : vehicles;

    useEffect(() => {
        if (vehicles) {
            setFilteredVehicles(filterVehicles())
        }
    }, [vehicleTypeFilter, selectedCity, vehicles])

    useEffect(() => {
        fetchVehicles();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                
            <View style={styles.curveSection}>
                <View style={styles.searchContainer}>
                    <View style={styles.vehiclePicker}>
                        <Picker
                            selectedValue={selectedState}
                            style={styles.vehiclePicker}
                            onValueChange={item => setSelectedState(item)}
                        >
                            <Picker.Item label="Punjab" value={"PB"} />
                            {
                                states.map((state) => {
                                    return <Picker.Item label={state.name} value={state.isoCode} />
                                })
                            }
                        </Picker>
                    </View>
                    <View style={styles.vehiclePicker}>
                        <Picker
                            selectedValue={selectedCity}
                            style={styles.vehiclePicker}
                            onValueChange={item => {
                                setSelectedCity(item); console.log("cur", item);
                            }}
                        >
                            <Picker.Item label="Select City" value={""} />
                            {cities &&
                                cities.map((city) => {
                                    return <Picker.Item label={city.name} value={city.name} style={styles.vehiclePicker} />
                                })
                            }
                        </Picker>
                    </View>
                </View>
                <View style={styles.vehicleFilterContainer}>
                    <Picker
                        selectedValue={vehicleTypeFilter}
                        style={styles.vehiclePicker}
                        onValueChange={item => setVehicleTypeFilter(item)}
                    >
                        <Picker.Item label="All Vehicle Types" value="" />
                        <Picker.Item label="CAR" value="CAR" />
                        <Picker.Item label="BUS" value="BUS" />
                        <Picker.Item label="TRUCK" value="TRUCK" />
                        <Picker.Item label="TAMPO" value="TAMPO" />
                    </Picker>
                </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={Colors.darkBlue} style={{ marginTop: 20 }} />
                ) : (
                    filteredVehicles.map((vehicle) => (
                        <RentVehicleCard vehicle={vehicle}/>
                    ))
                )}
            </ScrollView>
            {/* 
            <Modal
                animationType="fade"
                transparent={true}
                visible={showImageModal}
                onRequestClose={() => setShowImageModal(false)}
            >
                <BlurOverlay visible={showImageModal} onRequestClose={() => setShowImageModal(false)} />

                <View style={styles.modalContainer}>
                    {selectedImage &&
                        <View style={styles.modalContent}>
                            <Image source={{ uri: selectedImage }} style={styles.modalImage} />
                            <TouchableOpacity style={styles.closeButton} onPress={() => setShowImageModal(false)}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            </Modal> */}
        </SafeAreaView>
    );
};


const RentVehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
    return (
        <View key={vehicle.number} style={styles.card}>
            <Carousel 
            images={vehicle?.photos}
            height={deviceWidth * 0.6}
            />
            <Text style={styles.cardText}>Vehicle No: <Text style={{ color: "black" }}>{vehicle.number.toUpperCase()}</Text></Text>
            <Text style={styles.cardText}>Model: <Text style={{ color: "black" }}>{vehicle.model}</Text></Text>
            <Text style={styles.cardText}>Contact No: <Text style={{ color: "black" }}>{vehicle.contactNumber}</Text></Text>
            <Text style={styles.cardText}>Location: <Text style={{ color: "black" }}>{vehicle.location}</Text></Text>
            {vehicle.type === "BUS" && <>
                <View style={{ flexDirection: 'row', marginBottom: 20, paddingTop: 14, flexWrap: "wrap", gap: 5 }}>
                    <View style={{ alignItems: 'center' }}>
                        {vehicle?.isAC ? <Text style={styles.facilityBtn}>
                            AC
                        </Text> : <Text style={[styles.facilityBtn]}>
                            Non-AC
                        </Text>}
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        {vehicle?.curtain ? <Text style={styles.facilityBtn}>
                            Seat Cover
                        </Text> : null}
                    </View>

                    {/* Column for Train Ticket and Driver Button */}
                    <View style={{ alignItems: 'center' }}>
                        {vehicle?.isLuggageSpace ? <Text style={styles.facilityBtn}>
                            Luggage Space
                        </Text> : null}
                    </View>

                    {/* Column for Two Wheeler Courier and Chart Button */}
                    <View style={{ alignItems: 'center' }}>
                        {vehicle?.isSeatPushBack ? <Text style={styles.facilityBtn}>
                            Seat Push Back
                        </Text> : null}
                    </View>

                </View>
                <Text style={{ flex: 1, fontWeight: 'bold', color: '#87CEEB' , paddingLeft:10 }}>Amenities:</Text>
                {vehicle.amenities !== undefined && vehicle.amenities.length < 1 ? "" :
                    <View style={{
                        paddingTop: 1,
                        paddingBottom: 14,
                        flexDirection: 'row',
                    
                    }}>

                        {vehicle?.amenities?.includes("wifi") && <Image
                            source={require('@/assets/images/wifi-icon.png')}
                            style={{ width: 30, height: 30, marginHorizontal: 5 }}
                        />}
                        {vehicle?.amenities?.includes("blanket") && <Image
                            source={require('@/assets/images/blanket.png')}
                            style={{ width: 30, height: 30, marginHorizontal: 5 }}
                        />}
                        {vehicle?.amenities?.includes("bottle") && <Image
                            source={require('@/assets/images/bottle.png')}
                            style={{ width: 30, height: 30, marginHorizontal: 5 }}
                        />}
                        {vehicle?.amenities?.includes("charger") && <Image
                            source={require('@/assets/images/charger.png')}
                            style={{ width: 30, height: 30, marginHorizontal: 5 }}
                        />}
                        {vehicle?.amenities?.includes("meal") && <Image
                            source={require('@/assets/images/meal.png')}
                            style={{ width: 30, height: 30, marginHorizontal: 5 }}
                        />}
                        {vehicle?.amenities?.includes("pillow") && <Image
                            source={require('@/assets/images/pillow.png')}
                            style={{ width: 30, height: 30, marginHorizontal: 5 }}
                        />}
                        {vehicle?.amenities?.includes("tv") && <Image
                            source={require('@/assets/images/tv.png')}
                            style={{ width: 30, height: 30, marginHorizontal: 5 }}
                        />}
                    </View>}
            </>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        backgroundColor: "#EAEAEA",
    },
    curveSection: {
        backgroundColor:'#3086FF',
        padding: 10,
        margin:5,
        borderBottomLeftRadius: 20,  // Bottom-left corner radius
        borderBottomRightRadius: 20,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        // paddingHorizontal: 15,
        marginBottom: 2,
        paddingVertical:1,
        gap: 2,
        borderRadius:10
       
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: Colors.secondary,

    },
    vehicleFilterContainer: {
        flexDirection: 'row',
        // justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.secondary,
       
       
    },
    vehiclePicker: {
        flex: 1,
        marginHorizontal: 1,
        borderColor: Colors.secondary,
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor:'#fff',
         
    },
    card: {
        backgroundColor: "#fff",
        padding: 1,
        borderRadius: 5,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        margin: 10,
    },
    cardText: {
        marginBottom: 1,
        marginLeft:10,
        color: Colors.secondary,
        fontWeight: "500",
        fontSize: 15,
    },
    carouselItem: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        overflow: "hidden",
    },
    carouselImage: {
        width: viewportWidth * 0.8,
        height: 200,
    },
    pagerView: {
        width: viewportWidth * 0.8,
        height: 200,
    },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 8,
    },
    dotStyle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.darkBlue,
        marginHorizontal: 4,
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
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        elevation: 5,
        width: viewportWidth * 0.9,
    },
    modalImage: {
        width: viewportWidth * 0.8,
        height: viewportWidth * 0.8,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: Colors.darkBlue,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});

export default RentVehicleScreen;