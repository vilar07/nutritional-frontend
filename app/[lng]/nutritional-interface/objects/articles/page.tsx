"use client";
import { useTranslation } from "@wac/app/i18n/client";
import AnimatedText from "@wac/app/[lng]/components/animatedText/AnimatedText";
import { Menubar } from 'primereact/menubar';
import { MenuItem } from 'primereact/menuitem';
import Sidebar from "@wac/app/[lng]/components/sidebar/Sidebar";
import { Button } from 'primereact/button';
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { Dropdown } from 'primereact/dropdown';
import { TabMenu } from 'primereact/tabmenu';
import { Menu } from 'primereact/menu';
import { Toast } from 'primereact/toast';

interface PropsType {
    params: { lng: string };
}

export default function Articles({ params: { lng } }: PropsType) {
    const { t } = useTranslation(lng, "home");

    useEffect(() => {
        const isAdmin = localStorage.getItem("isAdmin");
        // If not Admin, alert and redirect to home
        if (isAdmin === "false") {
            alert("You are not an Admin.");
            window.location.href = "/";
        }
    }, []); // Empty dependency array ensures the effect runs only once
    
    const menuLeft = useRef<any>(null);
    const toast = useRef<Toast>(null);


    const items: MenuItem[] = [
        {
            label: 'Articles',
            icon: 'pi pi-book',
            url: '/nutritional-interface/objects/articles',
            className: 'bg-gray-200'
        },
        {
            label: 'Calculators',
            icon: 'pi pi-calculator',
            url: '/nutritional-interface/objects/calculators'
        },
        {
            label: 'Carousels',
            icon: 'pi pi-images',
            url: '/nutritional-interface/objects/carousels'
        },
        {
            label: 'Meal Cards',
            icon: 'pi pi-file',
            url: '/nutritional-interface/objects/mealCards'
        }
    ];
    const items2: MenuItem[] = [
        {
            label: 'Options',
            items: [
                {
                    label: 'Refresh',
                    icon: 'pi pi-refresh'
                },
                {
                    label: 'Export',
                    icon: 'pi pi-upload'
                }
            ]
        }
    ];
    const [orderBy, setOrderBy] = useState<any>(null);
    const orderByOptions = [
        {
            id: 1,
            name: "Most Recent",
            value: "Most Recent",
        },
        {
            id: 2,
            name: "Most Popular",
            value: "Most Popular",
        },
        {
            id: 3,
            name: "Best Rated",
            value: "Best Rating",
        },
    ];

    const [articles, setArticles] = useState<any[]>([]);
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [possibleOptions, setPossibleOptions] = useState<any>(null);
    const [characteristic, setCharacteristic] = useState<any>({});
    const [dropdownCharacteristics, setDropdownCharacteristics] = useState<any[]>([]);

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

    useEffect(() => {
        let apiUrl = 'http://localhost:4000/objects/articles';
    
        let queryParams = '';
        if (characteristic.length > 0 && selectedOption === null) {
            queryParams += `?characteristic=${characteristic}`;
        } else if (characteristic && selectedOption) {
            queryParams += `?characteristic=${characteristic}&option_selected=${selectedOption}`;
        }
    
        if (orderBy) {
            queryParams += (queryParams ? '&' : '?') + `order_by=${orderBy}`;
        }
    
        apiUrl += queryParams;
        console.log("API URL:", apiUrl);
    
        axios.get(apiUrl)
            .then((response) => {
                console.log("Response:", response.data);
                setArticles(response.data);
            })
            .catch((error) => {
                console.log("Error:", error);
                setArticles([]);
            });
    }, [characteristic, selectedOption, orderBy]);

    useEffect(() => {
        console.log("Characteristic:", characteristic);
        axios.get(`http://localhost:4000/characteristics/characteristics/${characteristic}`)
        .then(response => {
            console.log(response.data.characteristicsPossibleOptions.possibleOptions);
            const possibleOptions = response.data.characteristicsPossibleOptions.possibleOptions;

            // Split the string into an array of options
            const optionsArray = possibleOptions.split(',');
            const formattedTypes = optionsArray.map((item: any)  => ({
                name: item,
                value: item,
            }));
            setPossibleOptions(formattedTypes);
            console.log("Formatted Types2:", formattedTypes);
        })
        .catch(error => {
            console.log(error);
        });
        
    }, [characteristic]);

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
            text={"Articles"}
            className="mb-8  mt-8 text-center text-green2 text-4xl lg:text-7xl sm:text-6xl xs:text-4xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
            />
            <div className="w-full items-center justify-center hidden lg:flex">
                <Menubar model={items} className="border-2 rounded-lg"  />
            </div>
            <div className="w-full px-8 items-center justify-center flex lg:hidden">
                <Toast ref={toast}></Toast>
                <Menu model={items} popup ref={menuLeft}  id="popup_menu_left" />
                <Button label="Show Objects" icon="pi pi-align-left" className="mr-2" onClick={(event) => menuLeft.current.toggle(event)} aria-controls="popup_menu_left" aria-haspopup />
            </div>
            <div className="w-full grid grid-cols-1 gap-2 mt-8 p-8">
                <div className="w-full grid grid-cols-2 gap-2">
                    <div className="w-full flex justify-start items-center">
                        <a href="/nutritional-interface/objects/articles/create">
                            <Button label="Create an Article" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/>
                        </a>
                    </div>
                </div>   
                <div className="w-full flex flex-col justify-start items-start mt-4">
                    <h1 className="text-xl text-black text-opacity-70 ">Filter Articles by</h1>
                    <Button onClick={()=> {setCharacteristic([]); setSelectedOption(null); setPossibleOptions(null); setOrderBy(null)}} label="Reset Filter" className='px-1 bg-gray-300 text-white hover:bg-white hover:text-gray-500 ' text raised />
                </div>
                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
                    <div className="text-black text-opacity-60">
                        <Dropdown 
                            value={orderBy} 
                            onChange={(e) => setOrderBy(e.value)} 
                            options={orderByOptions} 
                            optionLabel="name" 
                            placeholder="Order By"
                            filter 
                            className="w-full h-12 border-2" 
                            panelClassName=' mt-1' 
                        />
                    </div>
                    <div className="text-black text-opacity-60">
                        <Dropdown 
                            value={characteristic} 
                            onChange={(e) => setCharacteristic(e.value)} 
                            options={dropdownCharacteristics} 
                            optionLabel="name" 
                            placeholder="Characteristic"
                            filter 
                            className="w-full h-12 border-2" 
                            panelClassName=' mt-1' 
                        />  
                    </div>
                    {possibleOptions && possibleOptions.length > 0 && (
                        <div className="text-black text-opacity-60 p-float-label">
                            <Dropdown 
                                value={selectedOption} 
                                onChange={(e) => setSelectedOption(e.value)} 
                                options={possibleOptions} 
                                optionLabel="name" 
                                placeholder="Select Option"
                                filter 
                                className="w-full h-12 border-2" 
                                panelClassName=' mt-1' 
                            />
                            <label htmlFor="optionName">Select the option</label>
                        </div>
                    )}
                </div>        
                <div className="w-full h-[800px] overflow-y-scroll">
                    <div className="w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 mt-4">
                        {articles.length > 0 ? (
                        articles.map((article: any) => (
                            <div key={article.ID} className="bg-green2 flex flex-col justify-between h-full p-4 border-2 rounded-xl text-center bg-green-200 hover:scale-105 shadow-xl">
                                <h1 className="text-xl text-black text-opacity-70 font-bold">{article.title}</h1>
                                <div className="bg-white border-4 border-gray-500 rounded-xl my-4 ">
                                    <a href={`/article/${article.ID}`}>
                                    {article.image && (
                                        <Image
                                        className='w-full h-40 object-cover border-2 rounded-xl'
                                        src={article.image}
                                        alt={'Article Image'}
                                        width={500}
                                        height={500}
                                        priority={true}
                                        />  
                                    )}
                                    </a>  
                                </div>
                                <p className="text-sm">{article.subtitle}</p>
                                <hr />
                                <a href={`/nutritional-interface/objects/articles/edit/${article.ID}`}>
                                    <Button label="Edit" className='mt-2 p-2 w-2/3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/>
                                </a>
                                <div className="w-full flex justify-end items-center mt-2">
                                    <p className="text-black text-opacity-45">{article.views} Views</p>
                                </div>
                            </div>
                        ))
                        ) : (
                        <p>No articles found.</p>
                        )}
                    </div>
                </div>
            </div>
          </div>  
        </div>
      );
}