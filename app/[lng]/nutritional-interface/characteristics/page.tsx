"use client";
import { useTranslation } from "@wac/app/i18n/client";
import React from 'react';
import AnimatedText from "../../components/animatedText/AnimatedText";
import {Card,Typography,List,ListItem,ListItemPrefix} from "@material-tailwind/react";
import {PresentationChartBarIcon,ShoppingBagIcon, UserCircleIcon,InboxIcon} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import axios from "axios";
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Sidebar from "../../components/sidebar/Sidebar";


interface PropsType {
    params: { lng: string };
}

export default function Characteristics({ params: { lng } }: PropsType) {
    const { t } = useTranslation(lng, "home");

    useEffect(() => {
        const isAdmin = localStorage.getItem("isAdmin");
        // If not Admin, alert and redirect to home
        if (isAdmin === "false") {
            alert("You are not an Admin.");
            window.location.href = "/";
        }
    }, []); // Empty dependency array ensures the effect runs only once


    const [showInput, setShowInput] = useState(false);
    const [showInput2, setShowInput2] = useState(false);
    const [visible, setVisible] = useState(false);
    const [visible2, setVisible2] = useState(false);
    const [visible3, setVisible3] = useState(false);
    const [visible4, setVisible4] = useState(false);
    const [visible5, setVisible5] = useState(false);
    const [visible6, setVisible6] = useState(false);
    const [visible7, setVisible7] = useState(false);
    const [characteristicName, setCharacteristicName] = useState("");
    const [characteristicPreviousName, setCharacteristicPreviousName] = useState("");
    const [characteristicType, setCharacteristicType] = useState("");
    const [characteristicProfileType, setCharacteristicProfileType] = useState("");
    const [selectedCharacteristicType2, setSelectedCharacteristicType2] = useState(null);
    const [selectedProfileCharacteristicType2, setSelectedProfileCharacteristicType2] = useState(null);
    const [selectedCharacteristicType3, setSelectedCharacteristicType3] = useState(null);
    const [selectedProfileCharacteristicType3, setSelectedProfileCharacteristicType3] = useState(null);
    const [possibleOption, setPossibleOption] = useState("");
    const [characteristicsTypes, setCharacteristicsTypes] = useState([]);
    const [selectedCharacteristicType, setSelectedCharacteristicType] = useState(null);

    const [profileCharacteristicsTypes, setProfileCharacteristicsTypes] = useState([]);
    const [selectedProfileCharacteristicType, setSelectedProfileCharacteristicType] = useState(null);

    const [characteristics, setCharacteristics] = useState([]);
    const [selectedCharacteristic, setSelectedCharacteristic] = useState(null);

    const [allCharacteristics, setAllCharacteristics] = useState([]);

    const [characteristic, setCharacteristic] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    });

    const [possibleOptions, setPossibleOptions] = useState([]);
    const [possibleOptions2, setPossibleOptions2] = useState([]);
    const [selectedPossibleOption, setSelectedPossibleOption] = useState("");
    const [selectedPossibleOption2, setSelectedPossibleOption2] = useState<string | null>(null);

    const fetchData = async () => {
        // Get all characteristics types
        axios.get('http://localhost:4000/characteristics/types') 
            .then((response) => {
                console.log("Response:", response.data);
                const formattedTypes = response.data.map((item: any)  => ({
                    name: item.variable_type,
                    value: item.variable_type,
                }));
                console.log("Formatted CharacteristicsTypes:", formattedTypes);
                setCharacteristicsTypes(formattedTypes);
            })
            .catch((error) => {
                console.log("Erro:", error);
            })
        // Get all profile characteristics types
        axios.get('http://localhost:4000/characteristics/profileTypes')
        .then((response) => {
            console.log("Response:", response.data);
            const formattedTypes = response.data.map((item: any)  => ({
                name: item.profile_characteristic_type,
                value: item.profile_characteristic_type,
            }));
            console.log("Formatted profile Types:", formattedTypes);
            setProfileCharacteristicsTypes(formattedTypes);
        })
        .catch((error) => {
            console.log("Erro:", error);
        })
        axios.get('http://localhost:4000/characteristics/characteristics') 
            .then((response) => {
                console.log("Response get all characteristic:", response.data);
                const formattedTypes = response.data.map((item: any)  => ({
                    name: item.name,
                    value: item.name,
                }));
                console.log("Formatted Types:", formattedTypes);
                setCharacteristics(formattedTypes);
                setAllCharacteristics(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log("Erro:", error);
            })
    };

    const fetchOptiondData = async () => {
        if(selectedCharacteristicType && selectedProfileCharacteristicType){
            axios.get(`http://localhost:4000/characteristics/possibleOptionsNameBased/${selectedCharacteristicType}/${selectedProfileCharacteristicType}`) 
            .then((response) => {
                console.log("Response Options Available:", response.data);
                const formattedTypes = response.data.map((item: any)  => ({
                    name: item.possibleOptions,
                    value: item.possibleOptions,
                }));
                setPossibleOptions(formattedTypes);

            })
            .catch((error) => {
                console.log("Erro:", error);
                setPossibleOptions([]);
            })
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Get all characteristics types
        console.log("Selected Characteristic:", selectedCharacteristic)
        if(selectedCharacteristic){
            axios.get(`http://localhost:4000/characteristics/characteristics/${selectedCharacteristic}`) 
            .then((response) => {
                console.log("Response:", response.data);
                setCharacteristic(response.data);
            })
            .catch((error) => {
                console.log("Erro:", error);
            })
        }
        
    }, [selectedCharacteristic]);

    useEffect(() => {
        // Get options by characteristics type and profile names
        if(selectedCharacteristicType && selectedProfileCharacteristicType){
            axios.get(`http://localhost:4000/characteristics/possibleOptionsNameBased/${selectedCharacteristicType}/${selectedProfileCharacteristicType}`) 
            .then((response) => {
                console.log("Response Options Available:", response.data);
                const formattedTypes = response.data.map((item: any)  => ({
                    name: item.possibleOptions,
                    value: item.possibleOptions,
                }));
                if(formattedTypes.length == 0) {
                    setPossibleOption("");
                }
                setPossibleOptions(formattedTypes);

            })
            .catch((error) => {
                console.log("Erro:", error);
                setPossibleOptions([]);
                setPossibleOption("");
            })
        }
        if(selectedCharacteristicType2 && selectedProfileCharacteristicType2){
            axios.get(`http://localhost:4000/characteristics/possibleOptionsNameBased/${selectedCharacteristicType2}/${selectedProfileCharacteristicType2}`) 
            .then((response) => {
                console.log("Response Options Available:", response.data);
                const formattedTypes = response.data.map((item: any)  => ({
                    name: item.possibleOptions,
                    value: item.possibleOptions,
                }));
                setPossibleOptions2(formattedTypes);

            })
            .catch((error) => {
                console.log("Erro:", error);
                setPossibleOptions2([]);
            })
        }
        
    }, [selectedCharacteristicType, selectedProfileCharacteristicType, selectedCharacteristicType2, selectedProfileCharacteristicType2]);

//---------------------------------Create Characteristic Type----------------------------------------------
    async function createCharacteristicType() {
        const confirmed = window.confirm(
            `Are you sure you want to create this characteristic type?\n
            Characteristic Type Name: ${characteristicType}\n`
          );
        if (!confirmed) {
            return;
        }
        const data = {
            "variable_type": characteristicType
        }
        await axios.post('http://localhost:4000/characteristics/type', data)
            .then((response) => {
                console.log("Response:", response.data);
                setVisible(false);
                fetchData();
                setSelectedCharacteristicType2(response.data.variable_type);
            })
            .catch((error) => {
                console.log("Erro:", error);
            })
    }

//---------------------------------Create Profile Characteristic Type----------------------------------------------
    async function createCharacteristicProfileType() {
        const confirmed = window.confirm(
            `Are you sure you want to create this characteristic profile type?\n
            Characteristic Profile Type Name: ${characteristicProfileType}\n`
          );
        if (!confirmed) {
            return;
        }
        const data = {
            "profile_characteristic_type": characteristicProfileType
        }
        await axios.post('http://localhost:4000/characteristics/profileType', data)
            .then((response) => {
                console.log("Response:", response.data);
                setVisible2(false);
                fetchData();
                setSelectedProfileCharacteristicType2(response.data.profile_characteristic_type);
            })
            .catch((error) => {
                console.log("Erro:", error);
            })
    }

//---------------------------------Possible Options----------------------------------------------
  const [inputValues, setInputValues] = useState(['']); // Initial state with an empty input
  const [inputValues2, setInputValues2] = useState(['']);

  const handleAddInput = () => {
    setInputValues([...inputValues, '']); // Add a new empty input to the state
    setInputValues2([...inputValues2, '']);
  };

  const handleInputChange = (index: any, value: any) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = value;
    setInputValues(newInputValues);

    const newInputValues2 = [...inputValues2];
    newInputValues2[index] = value;
    setInputValues2(newInputValues2);
  };

  const handleRemoveInput = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newInputValues = [...inputValues];
    newInputValues.pop();  // Remove the last element
    setInputValues(newInputValues);

    const newInputValues2 = [...inputValues2];
    newInputValues2.pop();  // Remove the last element
    setInputValues2(newInputValues2);
  };

  async function createPossibleOptions() {
    const resultOptions= inputValues.join(',');
    const data = {
        "possibleOptions": resultOptions,
        "profileCharacteristicsTypeName": selectedProfileCharacteristicType,
        "characteristicsTypeName": selectedCharacteristicType
    }
    console.log("data:", data)
    await axios.post('http://localhost:4000/characteristics/possibleOptionsNameBased', data)
        .then((response) => {
            console.log("Response creating Possible Options:", response.data);
            setVisible3(false);
            setShowInput(false);
            setInputValues(['']);
            setPossibleOption(resultOptions);
            fetchOptiondData();
            setSelectedPossibleOption(resultOptions);
            //window.location.reload();
        })
        .catch((error) => {
            console.log("Erro:", error);
        })

  }

  //---------------------------------Create Characteristic----------------------------------------------
  async function createCharacteristic() {
    console.log("Selected Possible Option:", selectedPossibleOption)
    if(characteristicName === "" || selectedCharacteristicType === null || selectedProfileCharacteristicType === null || selectedPossibleOption === ""){
        alert("All fields are required");
        return;
    }
    await axios.get(`http://localhost:4000/characteristics/possibleOptionsId?characteristicsTypeName=${selectedCharacteristicType}&profileCharacteristicsTypeName=${selectedProfileCharacteristicType}&possibleOptions=${selectedPossibleOption}`)
        .then((response) => {
            console.log("Response getting ID of Possible Options:", response.data.id);
            const data = {
                "name": characteristicName,
                "characteristicsPossibleOptionsId": response.data.id 
            }
            
            const confirmed = window.confirm(
                `Are you sure you want to create this characteristic?\n
                Characteristic Name: ${characteristicName}\n
                Characteristic Type: ${selectedCharacteristicType}\n
                Profile Characteristic Type: ${selectedProfileCharacteristicType}\n
                Possible Option: ${selectedPossibleOption}`
                );
        
            if (confirmed) {
                axios
                    .post('http://localhost:4000/characteristics/characteristics', data)
                    .then((response) => {
                        console.log('Response Creating Characteristic:', response.data);
                        window.location.reload();
                    })
                    .catch((error) => {
                        console.log('Error:', error);
                    });
            } else {
                console.log('Creating characteristic canceled.');
            }
        })
        .catch((error) => {
            console.log("Erro:", error);
        })

  }

async function deleteCharacteristicType() {
    const confirmed = window.confirm(
        `Are you sure you want to delete this characteristic type?\n
        Characteristic Type Name: ${selectedCharacteristicType2}\n
        Note that all characteristics and possible options that use\n
        this type will be deleted too.\n`
    );
    if (!confirmed) {
        return;
    }
    await axios.delete(`http://localhost:4000/characteristics/type/${selectedCharacteristicType2}`)
        .then((response) => {
            console.log("Response Deleted Characteristic Type:", response);
            //window.location.reload();
        })
        .catch((error) => {
            console.log("Erro:", error);
        })
}

async function deleteProfileCharacteristicType() {
    const confirmed = window.confirm(
        `Are you sure you want to delete this profile characteristic type?\n
        Profile Characteristic Type Name: ${selectedProfileCharacteristicType2}\n
        Note that all characteristics and possible options that use\n
        this type will be deleted too.\n`
    );
    if (!confirmed) {
        return;
    }
    await axios.delete(`http://localhost:4000/characteristics/profileType/${selectedProfileCharacteristicType2}`)
        .then((response) => {
            console.log("Response Deleted Profile Characteristic Type:", response);
            //window.location.reload();
        })
        .catch((error) => {
            console.log("Erro:", error);
        })
}

async function deletePossibleOptions(){
    const confirmed = window.confirm(
        `Are you sure you want to delete this possible option?\n
        Possible Option Name: ${selectedPossibleOption2}\n
        Note that all characteristics that use this possible options \n
        will be deleted too.\n`
    );
    if (!confirmed) {
        return;
    }
    await axios.delete(`http://localhost:4000/characteristics/possibleOptions/${selectedCharacteristicType2}/${selectedProfileCharacteristicType2}/${selectedPossibleOption2}`)
        .then((response) => {
            console.log("Response Deleted Possible Option:", response);
            //window.location.reload();
        })
        .catch((error) => {
            console.log("Erro:", error);
        })
}

useEffect(() => {
    console.log("Selected Possible Option:", selectedPossibleOption2)
    if (selectedPossibleOption2) {
      setInputValues(selectedPossibleOption2.split(','));
      console.log("Input Values:", selectedPossibleOption2.split(','))
    }
    if(possibleOption){
        setInputValues2(possibleOption.split(','));
    }
  }, [selectedPossibleOption2, possibleOption]);

async function updatePossibleOptions(){

    if (inputValues2.some(value => value.trim() === '')) {
        alert('Option Fields cant be empty.');
        return;
    }

    const confirmed = window.confirm(
        `Are you sure you want to update this possible option?\n
        Possible Option Name: ${possibleOption}\n
        With the new options: ${inputValues2.join(',')}\n
        All characteristics that use this possible options \n
        will be updated too.\n`
    );
    if (!confirmed) {
        return;
    }
    const resultOptions= inputValues2.join(',');

    const data = {
        "updatedPossibleOptions": resultOptions,
    }

    await axios.put(`http://localhost:4000/characteristics/possibleOptions/${selectedCharacteristicType}/${selectedProfileCharacteristicType}/${possibleOption}`, data)
        .then((response) => {
            console.log("Response Updated Possible Option:", response);
            setShowInput2(false);
            setPossibleOption(resultOptions);
            fetchOptiondData();
        })
        .catch((error) => {
            console.log("Erro:", error);
        })
}

async function updateCharacteristicProfileType(){
    const confirmed = window.confirm(
        `Are you sure you want to update this profile characteristic type?\n
        With the new name: ${characteristicProfileType}\n
        Profile Characteristic Type Name: ${selectedProfileCharacteristicType2}\n
        Note that all characteristics and possible options that use\n
        this type will be updated too.\n`
    );
    if (!confirmed) {
        return;
    }
    const data = {
        "updatedTypeName": characteristicProfileType
    }
    await axios.put(`http://localhost:4000/characteristics/profileType/${selectedProfileCharacteristicType2}`, data)
        .then((response) => {
            console.log("Response Updated Profile Characteristic Type:", response);
            window.location.reload();
        })
        .catch((error) => {
            console.log("Erro:", error);
        })
}

async function updateCharacteristicType(){
    const confirmed = window.confirm(
        `Are you sure you want to update this characteristic type?\n
        Characteristic Type Name: ${selectedCharacteristicType2}\n
        With the new name: ${characteristicType}\n
        Note that all characteristics and possible options that use\n
        this type will be updated too.\n`
    );
    if (!confirmed) {
        return;
    }
    const data = {
        "updatedTypeName": characteristicType
    }
    await axios.put(`http://localhost:4000/characteristics/type/${selectedCharacteristicType2}`, data)
        .then((response) => {
            console.log("Response Updated Characteristic Type:", response);
            window.location.reload();
        })
        .catch((error) => {
            console.log("Erro:", error);
        })
}

async function editCharacteristic() {
    if (selectedCharacteristicType === null || selectedProfileCharacteristicType === null || possibleOption === "") {
        alert('All fields are required.');
        return;
    }
    const confirmed = window.confirm(
        `Are you sure you want to update this characteristic?\n
        Characteristic Name: ${characteristicPreviousName}\n`
    );
    if (!confirmed) {
        return;
    }
    const optionsID = await axios.get(`http://localhost:4000/characteristics/possibleOptionsId?characteristicsTypeName=${selectedCharacteristicType}&profileCharacteristicsTypeName=${selectedProfileCharacteristicType}&possibleOptions=${possibleOption}`)
    console.log("Options ID:", optionsID.data.id)

    const data = {
        "name": characteristicName,
        "characteristicsPossibleOptionsId": optionsID.data.id
    }

    await axios.put(`http://localhost:4000/characteristics/characteristics/${characteristicPreviousName}`, data)
        .then((response) => {
            console.log("Response Updated Characteristic:", response);
            window.location.reload();
        })
        .catch((error) => {
            console.log("Erro:", error);
        })
}

async function deleteCharacteristic() {
    const confirmed = window.confirm(
        `Are you sure you want to delete this characteristic?\n
        Characteristic Name: ${characteristicPreviousName}\n
        Note that this characteristic will be removed from \n
        all objects that use it.\n`
    );

    if (!confirmed) {
        return;
    }
    await axios.delete(`http://localhost:4000/characteristics/characteristics/${characteristicPreviousName}`)
        .then((response) => {
            console.log("Response Deleted Characteristic:", response);
            //window.location.reload();
        })
        .catch((error) => {
            console.log("Erro:", error);
        })
}

    return (
        <div className="w-full flex">
            <div className="w-1/5 hidden md:flex">
                <Sidebar lng={lng} />
            </div>
          <div className="w-full md:w-4/5 flex flex-col mt-8">
            <div className="w-full flex items-center text-center justify-center md:hidden border-2 rounded-xl p-2 px-8">
                <div className="w-full grid grid-cols-3 gap-0">
                    <a href="/nutritional-interface/objects" className="w-full flex justify-center bg-gray-200 hover:bg-gray-300 border-2 rounded-xl">
                        <h1>Objetcs</h1>
                    </a>
                    <a href="/nutritional-interface/characteristics" className="w-full flex justify-center bg-gray-200 hover:bg-gray-300 border-2 rounded-xl">
                        <h1>Characteristics</h1>
                    </a>
                    <a href="/nutritional-interface/reports" className="w-full flex justify-center bg-gray-200 hover:bg-gray-300 border-2 rounded-xl">
                        <h1>Reports</h1>
                    </a>
                </div>
            </div>
            <AnimatedText
            text={"Characteristics"}
            className="mb-4  mt-8 text-center text-green2 text-4xl lg:text-7xl sm:text-6xl xs:text-4xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
            />
                <div className="w-full grid grid-cols-1 gap-4 justify-center items-center text-center   p-16 rounded-xl  border-opacity-30">
                    <h1 className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-2xl">Available Characteristics</h1>
                    <div className="w-full overflow-x-auto">
                        <div className="card overflow-hidden">
                            <DataTable value={allCharacteristics} stripedRows paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} tableStyle={{ minWidth: '50rem' }}
                            showGridlines dataKey="id" filters={filters} filterDisplay="row" loading={loading} paginatorClassName="" className="border-2 rounded-xl">
                                <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" style={{ width: '22%' }} headerClassName="text-sm" bodyClassName="border-2"/>
                                <Column 
                                    field="characteristicsPossibleOptions.profileCharacteristicsType" 
                                    headerClassName="text-sm"
                                    header="Profile Characteristic Type" 
                                    style={{ width: '22%' }}
                                    body={(rowData) => rowData.characteristicsPossibleOptions.profileCharacteristicsType[0]?.profile_characteristic_type || ''}
                                    bodyClassName="border-2"
                                />
                                <Column 
                                    field="characteristicsPossibleOptions.characteristicsType" 
                                    headerClassName="text-sm"
                                    header="Characteristic Type" 
                                    style={{ width: '22%' }}
                                    body={(rowData) => rowData.characteristicsPossibleOptions.characteristicsType[0]?.variable_type || ''}
                                    bodyClassName="border-2"
                                />
                                <Column field="characteristicsPossibleOptions.possibleOptions" header="Possible Options" style={{ width: '22%' }} bodyClassName="border-2" />
                                <Column 
                                    header=""
                                    headerClassName="text-sm"
                                    bodyClassName="border-2"
                                    body={(rowData) => (
                                        <>
                                            <Button label="Edit" icon="pi pi-pencil" 
                                            onClick={() =>{setVisible7(true); setCharacteristicName(rowData.name); setCharacteristicPreviousName(rowData.name); setSelectedProfileCharacteristicType(rowData.characteristicsPossibleOptions.profileCharacteristicsType[0]?.profile_characteristic_type); setSelectedCharacteristicType(rowData.characteristicsPossibleOptions.characteristicsType[0]?.variable_type);
                                            setPossibleOption(rowData.characteristicsPossibleOptions.possibleOptions);}}
                                            className='w-full p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                            <Dialog header="Edit Characteristic Name" visible={visible7} style={{ width: '50vw' }} onHide={() => {setVisible7(false); setSelectedProfileCharacteristicType(null); setSelectedCharacteristicType(null);
                                            setInputValues(['']); setShowInput(false); setCharacteristicName("") }}>
                                                    <div className="w-full grid grid-cols-1 gap-8">
                                                        <div className="w-full p-float-label mt-5">
                                                            <InputText id="characteristicName" value={characteristicName} onChange={(e) => setCharacteristicName(e.target.value)} className='h-12 w-full border-2 border-solid'  />
                                                            <label htmlFor="characteristicName">Characteristic Name</label>
                                                        </div>
                                                        <div className="w-full text-black text-opacity-60 p-float-label">
                                                            <Dropdown value={selectedProfileCharacteristicType} onChange={(e) => setSelectedProfileCharacteristicType(e.value)} options={profileCharacteristicsTypes} optionLabel="name" placeholder="" 
                                                            filter className="w-full h-12 border-2" panelClassName=' mt-1' />
                                                            <label htmlFor="characteristicName">Profile Characteristic Type</label>
                                                        </div>
                                                        <div className="w-full text-black text-opacity-60 p-float-label">
                                                            <Dropdown value={selectedCharacteristicType} onChange={(e) => setSelectedCharacteristicType(e.value)} options={characteristicsTypes} optionLabel="name" placeholder="" 
                                                            filter className="w-full h-12 border-2" panelClassName=' mt-1' />
                                                            <label htmlFor="characteristicName">Characteristic Type</label>
                                                        </div>
                                                        <div className="w-full grid grid-cols-1 gap-1 text-black text-opacity-60 border-2 p-1 lg:p-8 rounded-lg ">
                                                            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
                                                                <div className="w-full md:col-span-2 lg:col-span-3 p-float-label">
                                                                    <Dropdown value={possibleOption} onChange={(e) => setPossibleOption(e.value)} options={possibleOptions} optionLabel="name" placeholder="" 
                                                                    filter className="w-full h-12 border-2" panelClassName=' mt-1' />
                                                                    <label htmlFor="characteristicName">Possible Options</label>
                                                                </div>
                                                                <div className="w-full ">
                                                                    <Button onClick={() => {setShowInput2(!showInput2); setShowInput(false);} } label={showInput2 ? "Cancel" : "Edit Options"} className=' w-full p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                                                </div>
                                                            </div>
                                                            {showInput2 && (
                                                                <>
                                                                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 justify-center items-center mt-2">
                                                                        {inputValues2.map((input, index) => (
                                                                            <div key={index} className="input-item">
                                                                                <InputText value={input} onChange={(e) => handleInputChange(index, e.target.value)} className='h-12 w-full border-2 border-solid' placeholder={`Option ${index + 1}`}  />
                                                                            </div>
                                                                        ))}
                                                                        <div className="w-full grid grid-cols-2 gap-1">
                                                                            <Button onClick={handleAddInput} label="+" className='w-full p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                                                            <Button onClick={handleRemoveInput} label="-" className='w-full p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                                                        </div> 
                                                                    </div> 
                                                                    <Button onClick={updatePossibleOptions} label="Update Options" className='w-full md:w-1/2 lg:w-1/4 p-3 bg-blue-500 text-white hover:bg-white hover:text-blue-500 mb-4' text raised/>
                                                                </>      
                                                            )}
                                                            <Button onClick={() => {setShowInput(!showInput); setInputValues(['']); setShowInput2(false);}} label={showInput ? "Cancel" : "Create New Possible Options"} icon="pi" className='w-full lg:w-1/2 p-1 bg-blue-500 text-white hover:bg-white hover:text-blue-500 mt-1'/>
                                                            {showInput && (
                                                                <>
                                                                    <div className="w-full grid grid-cols-4 gap-2 justify-center items-center mt-2">
                                                                        {inputValues.map((input, index) => (
                                                                            <div key={index} className="input-item">
                                                                                <InputText value={input} onChange={(e) => handleInputChange(index, e.target.value)} className='h-12 w-full border-2 border-solid' placeholder={`Option ${index + 1}`}  />
                                                                            </div>
                                                                        ))}
                                                                        <div className="w-full grid grid-cols-2 gap-1">
                                                                            <Button onClick={handleAddInput} label="+" className='w-full p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                                                            <Button onClick={handleRemoveInput} label="-" className='w-full p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                                                        </div> 
                                                                    </div> 
                                                                    <Button onClick={createPossibleOptions} label="Create" className='w-1/4 p-3 bg-blue-500 text-white hover:bg-white hover:text-blue-500 mt-1' text raised/>
                                                                </>      
                                                            )}  
                                                        </div>
                                                        <div className="w-full lg:w-1/2 grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
                                                            <Button onClick={editCharacteristic} label="Update Characteristic" className='w-full p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/>
                                                            <Button onClick={deleteCharacteristic} label="Delete Characteristic" className='w-full p-3 bg-red-500 text-white hover:bg-white hover:text-red-500 ' text raised/>
                                                        </div>
                                                    </div>    
                                            </Dialog>
                                        </>       
                                    )}
                                    style={{ width: '12%' }}
                                />
                            </DataTable>
                        </div>      
                    </div>
                </div>
                <div className="w-full grid grid-cols-1 gap-8 justify-center items-center text-center my-8 rounded-xl border-2 shadow-lg p-16 border-green2 border-opacity-30">
                    <h1 className="w-full text-2xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">Create New Characteristics</h1>
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-center text-center  ">
                        <div className="w-full p-float-label">
                            <InputText id="username" value={characteristicName} onChange={(e) => setCharacteristicName(e.target.value)} className='h-12 w-full'  />
                            <label htmlFor="username">Characteristic Name</label>
                        </div>
                        <div className="w-full text-black text-opacity-60 p-float-label">
                            <Dropdown value={selectedCharacteristicType} onChange={(e) => setSelectedCharacteristicType(e.value)} options={characteristicsTypes} optionLabel="name" placeholder="" 
                            filter className="w-full h-12" panelClassName=' mt-1' />
                            <label htmlFor="username">Select a Type</label>
                        </div>
                        <div className="w-full text-black text-opacity-60 p-float-label">
                            <Dropdown value={selectedProfileCharacteristicType} onChange={(e) => setSelectedProfileCharacteristicType(e.value)} options={profileCharacteristicsTypes} optionLabel="name" placeholder="" 
                            filter className="w-full h-12" panelClassName=' mt-1' />
                            <label htmlFor="username">Select a Profile Type</label>
                        </div>
                        {possibleOptions.length > 0 && selectedCharacteristicType !== null && selectedProfileCharacteristicType !== null ? (
                            <>
                                <div className="w-full grid grid-cols-1 text-black text-opacity-60 p-float-label">
                                    <Dropdown value={selectedPossibleOption} onChange={(e) => setSelectedPossibleOption(e.value)} options={possibleOptions} optionLabel="name" placeholder="" 
                                    filter className="w-full h-12 " panelClassName=' mt-1' />
                                    <label htmlFor="username">Select Possible Options</label>
                                </div>
                                <div className="w-full flex text-start">
                                <Button onClick={() => { setVisible3(true);setCharacteristicType("");setCharacteristicProfileType(""); }} label="Create New Possible Options" className='p-2 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/>
                                </div> 
                            </>  
                        ) : (
                            (selectedCharacteristicType !== null && selectedProfileCharacteristicType !== null) && (
                                <>
                                    <div className="w-full text-black text-opacity-60 p-float-label">
                                        <p>No options Avaiable for that two characteristic type and profile type.</p>
                                        <Button onClick={() => { setVisible3(true);setCharacteristicType("");setCharacteristicProfileType(""); }} label="Create New Possible Options" className='p-1 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/>
                                    </div>
                                </> 
                            )
                        )}
                         
                        
                    </div>
                    <div className="w-full flex justify-start items-center">
                            <Button onClick={createCharacteristic} label="Create Characteristic" className='p-3 bg-blue-500 text-white hover:bg-white hover:text-blue-500 px-8' text raised/>
                    </div>
                    <div className="w-full flex justify-start text-start text-black text-opacity-50">
                            <p>If the characteristics type, profile characteristics type or options available to create a Characteristic are not the pretended ones, Log in as Administrator to Create new ones or edit/delete existing ones.</p>
                    </div>
                </div>
                <div className="w-full grid grid-cols-1 gap-8 justify-center items-center text-center my-8 rounded-xl border-2 shadow-lg p-16 border-green2 border-opacity-30">
                    <h1 className="w-full text-2xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">Create, Edit or Remove, characteristics and options</h1>
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center items-center">
                        <div className="bg-green2 w-full border-2 shadow-lg p-2 rounded-xl font-bold grid grid-cols-1 gap-2  hover:scale-105">
                            <h1 className="">Available Characteristics Type</h1>
                            <hr />
                            <div className="w-full mt-2 text-black text-opacity-60">
                            <Dropdown value={selectedCharacteristicType2} onChange={(e) => setSelectedCharacteristicType2(e.value)} options={characteristicsTypes} optionLabel="name" placeholder="" 
                            filter  className="w-full " panelClassName=' mt-1' />
                            </div>
                            <div className="w-full grid grid-cols-3 gap-2">
                                <Button onClick={() => { setVisible(true); setCharacteristicType(""); }} label="Create" className='p-3 bg-blue-500 text-white hover:bg-white hover:text-blue-500 ' text raised/>
                                <Dialog header="Create a New Characteristic Type" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
                                    <div className="w-full grid grid-cols-1 gap-2 justify-center items-center">
                                        <div className="w-full p-float-label mt-5">
                                            <InputText id="characteristicType" value={characteristicType} onChange={(e) => setCharacteristicType(e.target.value)} className='h-12 w-full border-2 border-solid'  />
                                            <label htmlFor="characteristicType">Characteristic Type Name</label>
                                        </div>
                                        <div className="w-full md:w-1/3 lg:w-1/4 mt-2">
                                            <Button onClick={createCharacteristicType}  label="Create" className='w-full p-3 bg-blue-500 text-white hover:bg-white hover:text-blue-500 ' text raised/>
                                        </div>
                                    </div>
                                </Dialog>
                                {selectedCharacteristicType2 !== null && (
                                    <>
                                        <Button onClick={() => {
                                        setVisible5(true);
                                        setCharacteristicType(selectedCharacteristicType2); // Set initial value
                                        }} label="Edit" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                        <Dialog header="Edit Characteristic Type" visible={visible5} style={{ width: '50vw' }} onHide={() => { setVisible5(false);  }}>
                                        <div className="w-full grid grid-cols-1 gap-2 justify-center items-center mt-2">
                                            <div className="w-full grid grid-cols-1 gap-2 justify-center items-center">
                                                <InputText value={characteristicType} onChange={(e) => setCharacteristicType(e.target.value)} className='h-12 w-full border-2 border-solid'  />
                                            </div>
                                            <div className="w-1/4 mt-2">
                                            <Button onClick={updateCharacteristicType} label="Update" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                            </div>
                                        </div>
                                        </Dialog>
                                        <Button onClick={deleteCharacteristicType} label="Delete" className='p-3 bg-red-500 text-white hover:bg-white hover:text-red-500 ' text raised/>
                                    </>
                                    
                                )}
                            </div>
                        </div>
                        <div className="bg-green2 w-full border-2 shadow-lg p-2 rounded-xl font-bold grid grid-cols-1 gap-2  hover:scale-105">
                            <h1 className="">Available Profile Characteristics Type</h1>
                            <hr />
                            <div className="w-full mt-2 text-black text-opacity-60">
                            <Dropdown value={selectedProfileCharacteristicType2} onChange={(e) => setSelectedProfileCharacteristicType2(e.value)} options={profileCharacteristicsTypes} optionLabel="name" placeholder="" 
                            filter className="w-full " panelClassName=' mt-1' />
                            </div>
                            <div className="w-full grid grid-cols-3 gap-2">
                                <Button onClick={() => { setVisible2(true); setCharacteristicProfileType(""); }} label="Create" className='p-3 bg-blue-500 text-white hover:bg-white hover:text-blue-500 ' text raised/>
                                <Dialog header="Create a New Characteristic Profile Type" visible={visible2} style={{ width: '50vw' }} onHide={() => setVisible2(false)}>
                                    <div className="w-full grid grid-cols-1 gap-2 justify-center items-center">
                                        <div className="w-full p-float-label mt-5">
                                            <InputText id="characteristicProfileType" value={characteristicProfileType} onChange={(e) => setCharacteristicProfileType(e.target.value)} className='h-12 w-full border-2 border-solid'  />
                                            <label htmlFor="characteristicProfileType">Characteristic Profile Type Name</label>
                                        </div>
                                        <div className="w-full md:w-1/3 lg:w-1/4 mt-2">
                                            <Button onClick={createCharacteristicProfileType}  label="Create" className='w-full p-3 bg-blue-500 text-white hover:bg-white hover:text-blue-500 ' text raised/>
                                        </div>
                                    </div>
                                </Dialog>
                                {selectedProfileCharacteristicType2 !== null && (
                                    <>
                                        <Button onClick={() => {
                                        setVisible6(true);
                                        setCharacteristicProfileType(selectedProfileCharacteristicType2); // Set initial value
                                        }} label="Edit" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                        <Dialog header="Edit Characteristic Profile Type" visible={visible6} style={{ width: '50vw' }} onHide={() => { setVisible6(false);  }}>
                                        <div className="w-full grid grid-cols-1 gap-2 justify-center items-center mt-2">
                                            <div className="w-full grid grid-cols-1 gap-2 justify-center items-center">
                                                <InputText value={characteristicProfileType} onChange={(e) => setCharacteristicProfileType(e.target.value)} className='h-12 w-full border-2 border-solid'  />
                                            </div>
                                            <div className="w-1/4 mt-2">
                                            <Button onClick={updateCharacteristicProfileType} label="Update" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                            </div>
                                        </div>
                                        </Dialog>
                                        <Button onClick={deleteProfileCharacteristicType}  label="Delete" className='p-3 bg-red-500 text-white hover:bg-white hover:text-red-500 ' text raised/>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="bg-green2 w-full border-2 shadow-lg p-2 rounded-xl font-bold grid grid-cols-1 gap-2  hover:scale-105">
                            <h1 className="">Available Possible Options</h1>
                            <hr />
                            {possibleOptions2.length > 0 ? (
                                <div className="w-full mt-2 text-black text-opacity-60">
                                <Dropdown value={selectedPossibleOption2} onChange={(e) => setSelectedPossibleOption2(e.value)} options={possibleOptions2} optionLabel="name" placeholder="Watch Options Available" 
                                filter className="w-full " panelClassName=' mt-1' />
                                </div>
                            ):( 
                                <>
                                    {selectedCharacteristicType2 !== null && selectedProfileCharacteristicType2 !== null ? (
                                    <div className="w-full mt-2 text-black text-opacity-60">
                                        <p>No options Available for that two characteristic type and profile type.</p>
                                        <p className="underline">Create new options for that in the section above.</p>
                                    </div>
                                    ):(
                                        <div className="w-full mt-2 text-black text-opacity-60">
                                            <p>Select first the previous two characteristic profile and type to see the options available for it</p>
                                        </div>
                                    )}
                                </>
                                    
                            )}
                            <div className="w-full grid grid-cols-3 gap-2">
                                <Button onClick={() => { setVisible3(true);setCharacteristicType("");setCharacteristicProfileType(""); }} label="Create" className='p-3 bg-blue-500 text-white hover:bg-white hover:text-blue-500 ' text raised/>
                                <Dialog header="Create a New Possible Options" visible={visible3} style={{ width: '50vw' }} onHide={() => {setVisible3(false); setInputValues(['']);}}>
                                    <div className="w-full grid grid-cols-1 gap-2 justify-center items-center mt-6">
                                        <div className="w-full grid grid-cols-1 md:lg-grid-cols-2 lg:grid-cols-4 gap-2 justify-center items-center">
                                            {inputValues.map((input, index) => (
                                                <div key={index} className="input-item">
                                                    <div className="flex flex-col items-center p-float-label"> {/* Wrap input and label in a flex container */}
                                                        <InputText 
                                                            id={`option-${index}`} 
                                                            value={input} 
                                                            onChange={(e) => handleInputChange(index, e.target.value)} 
                                                            className='h-12 w-full border-2 border-solid' 
                                                            placeholder=""
                                                        />
                                                        <label htmlFor={`option-${index}`} className="mb-1">Option {index + 1}</label>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="w-full grid grid-cols-2 gap-1">
                                                <Button onClick={handleAddInput} label="+" className='w-full p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                                <Button onClick={handleRemoveInput} label="-" className='w-full p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                            </div>
                                        </div> 
                                        <div className="w-full md:w-1/3 lg:w-1/4 mt-2">
                                            <Button onClick={createPossibleOptions}  label="Create" className='w-full p-3 bg-blue-500 text-white hover:bg-white hover:text-blue-500 ' text raised/>
                                        </div>
                                    </div>
                                </Dialog>
                                {selectedPossibleOption2!== null && (
                                    <>
                                        <Button onClick={() => setVisible4(true)} label="Edit" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                        <Dialog header="Edit Possible Options" visible={visible4} style={{ width: '50vw' }} onHide={() => { setVisible4(false);  }}>
                                        <div className="w-full grid grid-cols-1 gap-2 justify-center items-center mt-2">
                                            <div className="w-full grid grid-cols-4 gap-2 justify-center items-center">
                                            {inputValues.map((input, index) => (
                                                <div key={index} className="input-item">
                                                <InputText value={input} onChange={(e) => handleInputChange(index, e.target.value)} className='h-12 w-full border-2 border-solid' placeholder={`Option ${index + 1}`} />
                                                </div>
                                            ))}
                                            <div className="w-full grid grid-cols-2 gap-1">
                                            <Button onClick={handleAddInput} label="+" className='w-full p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                            <Button onClick={handleRemoveInput} label="-" className='w-full p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                            </div> 
                                            </div>
                                            <div className="w-1/4 mt-2">
                                            <Button onClick={updatePossibleOptions} label="Update" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                            </div>
                                        </div>
                                        </Dialog>
                            
                                        <Button onClick={deletePossibleOptions} label="Delete" className='p-3 bg-red-500 text-white hover:bg-white hover:text-red-500 ' text raised />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}