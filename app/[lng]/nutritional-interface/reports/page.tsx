"use client";
import { useTranslation } from "@wac/app/i18n/client";
import AnimatedText from "../../components/animatedText/AnimatedText";
import Sidebar from "../../components/sidebar/Sidebar";
import { useState, useEffect, JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal } from "react";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { Rating } from "primereact/rating";
import { Chart } from 'primereact/chart';


interface PropsType {
    params: { lng: string };
}

export default function Reports({ params: { lng } }: PropsType) {
    useEffect(() => {
        const isAdmin = localStorage.getItem("isAdmin");
        // If not Admin, alert and redirect to home
        if (isAdmin === "false") {
            alert("You are not an Admin.");
            window.location.href = "/";
        }
    }, []); // Empty dependency array ensures the effect runs only once
    
    const { t } = useTranslation(lng, "home");

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [characteristicsData, setCharacteristicsData] = useState<any>([]);

    // Get all users
    useEffect(() => {
        axios.get(`http://localhost:4000/users`) 
        .then((response) => {
            console.log("Response:", response.data.data);
            const formattedTypes = response.data.data.map((item: any)  => ({
                email: item.email,
                value: item.email,
            }));
            console.log("Formatted Types:", formattedTypes);
            setUsers(formattedTypes);
        })
        .catch((error) => {
            console.log("Erro:", error);
        })
    }, []);

    const [dropdownCharacteristics, setDropdownCharacteristics] = useState<any[]>([]);
    const [characteristic, setCharacteristic] = useState<any>(null);
    useEffect(() => {
        axios.get('http://localhost:4000/characteristics/characteristics')
        .then(response => {
            console.log(response.data);
            const formattedTypes = response.data.map((item: any)  => ({
                name: item.name,
                value: item.name,
            }));
            console.log("Formatted Types:", formattedTypes);
            setDropdownCharacteristics(formattedTypes);
        })
        .catch(error => {
            console.log(error);
        });
        
    }, []);

    //Get Characteristics of the selected user
    useEffect(() => {
        if (!selectedUser) return;
        axios.get(`http://localhost:4000/users/characteritics/${selectedUser}`) 
        .then((response) => {
            console.log("Response characteristics of an user:", response.data.data);
            const data = response.data.data;
            const formattedData = formatData(data);
            setCharacteristicsData(formattedData);
        })
        .catch((error) => {
            console.log("Erro:", error);
            setCharacteristicsData([]);
        })
    }, [selectedUser]);


    // Chart Data useEffect
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    useEffect(() => {
        if(!characteristic) return;
        axios.get(`http://localhost:4000/users/characteritics/count/${characteristic}`)
            .then(response => {
                console.log("Characteristics Users Count:", response.data.data);
                const labels = Object.keys(response.data.data);
                const dataValues = Object.values(response.data.data);
                // Generating random background colors for the bars, avoiding white or transparent colors
                const backgroundColors = labels.map(() => {
                    let color;
                    do {
                        color = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`;
                    } while (color === 'rgba(255, 255, 255, 1)' || color === 'rgba(0, 0, 0, 0)');
                    return color;
                });
                
                // Generating border colors for the bars
                const borderColors = backgroundColors.map(color => color.replace('0.2', '1'));
                // Creating the chart data object
                const chartData = {
                    labels: labels,
                    datasets: [
                    {
                        label: 'Users Count',
                        data: dataValues,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1
                    }
                    ]
                };
                
                // Chart options remain the same
                const options = {
                    scales: {
                    y: {
                        beginAtZero: true
                    }
                    }
                };
                
                // Set the chart data and options
                setChartData(chartData);
                setChartOptions(options);
            })
            .catch(error => {
                console.log(error);
            });
        }, [characteristic]);

   // Function to format the received data
   const formatData = (data: any) => {
    const formattedData = [];

    for (const title in data) {
        const options = data[title].map((option: { option: any; trust_level: any; }) => ({
            option: option.option,
            trust_level: option.trust_level
        }));
        formattedData.push({
            title,
            options
        });
    }

    return formattedData;
};

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
            text={"Reports"}
            className="mb-8  mt-8 text-center text-green2 text-4xl lg:text-7xl sm:text-6xl xs:text-4xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
            />
                <div className="w-full grid grid-cols-1 gap-2 p-8">
                    <div className="w-full justify-start">
                        <h1 className="text-3xl text-green2 font-bold">Users</h1>
                    </div>
                    <div className="w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="w-full">
                            <div className="w-full text-black text-opacity-60">
                                <Dropdown value={selectedUser} onChange={(e) => setSelectedUser(e.value)} options={users} optionLabel="email" placeholder="Select an User" 
                                filter className="w-full h-12 border-2" panelClassName=' mt-1' />
                            </div>
                        </div>
                        <div className="w-full lg:col-span-3 md:col-span-2 xs:col-span-1">
                            {characteristicsData.length > 0 && 
                                <div className="w-full">
                                    <div className="w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-1 xl:grid-cols-3 gap-2 border-2 rounded-xl p-4 overflow-y-scroll">
                                        {characteristicsData.map((item: { title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | Iterable<ReactNode> | null | undefined; options: any[]; }, index: Key | null | undefined) => (
                                            <div className="w-full" key={index}>
                                                <h2 className="w-full text-xl text-green2 font-bold">{item.title}</h2>
                                                <h4 className="w-full text-xs text-black text-opacity-50 mb-2">Option with Probability </h4>
                                                <ul className="w-full text-md">
                                                    {item.options.map((option, i) => (
                                                        <li className="w-full grid grid-cols-1 mb-4" key={i}>
                                                            {option.option} <Rating value={option.trust_level} readOnly cancel={false} stars={10} />
                                                        </li>
                                                    ))}
                                                </ul>
                                                
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <hr className="my-4"/>
                    <div className="w-full justify-start">
                        <h1 className="text-3xl text-green2 font-bold">General Overview</h1>
                    </div>
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
                        <div className="w-full">
                            <div className="w-full text-black text-opacity-60 ">
                                <Dropdown value={characteristic} onChange={(e) => setCharacteristic(e.value)} options={dropdownCharacteristics} optionLabel="name" placeholder="Select Characteristic" 
                                filter className="w-full h-12 border-2" panelClassName=' mt-1' />
                            </div>
                        </div>
                        <div className="w-full col-span-4">
                            { characteristic === null ?
                                <div className="w-full">
                                    
                                </div>
                                :
                                <div className="w-full">
                                    <Chart type="bar" data={chartData} options={chartOptions} />
                                </div>     
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}