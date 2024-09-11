"use client";
import { useTranslation } from "@wac/app/i18n/client";
import AnimatedText from "@wac/app/[lng]/components/animatedText/AnimatedText";
import Sidebar from "@wac/app/[lng]/components/sidebar/Sidebar";
import { Button } from 'primereact/button';
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import { Dropdown } from 'primereact/dropdown';
import { Editor } from 'primereact/editor';
import Slider from "react-slick";
import React from "react";
import carousel from "@wac/app/[lng]/carousel/[id]/page";


interface PropsType {
    params: { id: string; lng?: string }; // Making lng optional
}

export default function editCarousel({ params }: PropsType) {

    useEffect(() => {
        const isAdmin = localStorage.getItem("isAdmin");
        // If not Admin, alert and redirect to home
        if (isAdmin === "false") {
            alert("You are not an Admin.");
            window.location.href = "/";
        }
    }, []); // Empty dependency array ensures the effect runs only once

    const formatDescriptionHTML = (htmlString: any) => {
        // Regular expression to add list item numbers for ordered lists
        const regexOrderedList = /<li>(.*?)<\/li>/g;
        let matchOrderedList;
        let counter = 1;
        while ((matchOrderedList = regexOrderedList.exec(htmlString)) !== null) {
            // Check if the list is an ordered list
            if (/<ol>/g.test(matchOrderedList.input)) {
                // Replace the list item with the counter and the content
                htmlString = htmlString.replace(
                    matchOrderedList[0],
                    `<li>${counter}. ${matchOrderedList[1]}</li>`
                );
                counter++;
            } else {
                // If it's an unordered list, add a bullet point in front of the content
                htmlString = htmlString.replace(
                    matchOrderedList[0],
                    `<li>&#8226; ${matchOrderedList[1]}</li>`
                );
            }
        }
    
        // Replace blockquote with custom class to ensure correct styling
        htmlString = htmlString.replace(
            /<blockquote>/g,
            '<blockquote className="blockquote">'
        );
    
        // Replace pre elements with class ql-syntax to ensure correct styling
        htmlString = htmlString.replace(
            /<pre class="ql-syntax"(.*?)>(.*?)<\/pre>/g,
            '<pre className="ql-syntax" $1>$2</pre>'
        );
    
       // Regular expression to replace p elements with alignment classes
    htmlString = htmlString.replace(
        /<p class="ql-align-(justify|right|center)">(.*?)<\/p>/g,
        function (_match: any, alignment: string, content: string) {
            let alignmentClass = '';
            if (alignment === 'justify') {
                alignmentClass = 'text-justify';
            } else if (alignment === 'right') {
                alignmentClass = 'text-right';
            } else if (alignment === 'center') {
                alignmentClass = 'text-center';
            }
            return `<div className="${alignmentClass}">${content}</div>`;
        }
    );

        console.log(htmlString);
    
        // Replace span and strong elements with optional ql-size class or inline styles with appropriate font size
        htmlString = htmlString.replace(
            /<(span|strong)(?: class="ql-size-(huge|large|small)")?(?: style="(.*?)")?>(.*?)<\/(?:span|strong)>/g,
            function (_match: any, p1: any, p2: string, p3: string, p4: any) {
                let fontSize = '';
                let styles = p3 || '';
    
                if (p2 === 'huge') {
                    fontSize = '3rem';
                } else if (p2 === 'large') {
                    fontSize = '1.5rem';
                } else if (p2 === 'small') {
                    fontSize = '1rem';
                }
    
                // Check if color style is present, if not, add it
                if (!styles.includes('color')) {
                    styles += 'color: var(--tw-prose-bold);';
                }
    
                return `<${p1} style="font-size: ${fontSize}; ${styles}">${p4}</${p1}>`;
            }
        );
    
        return htmlString;
    };

    const renderHeader = () => {
        return (
            <span className="ql-formats">
                <select className="ql-size" defaultValue="small">
                    <option value="small"></option>
                    <option value="large"></option>
                    <option value="huge"></option>
                </select>
                <button className="ql-bold" aria-label="Bold"></button>
                <button className="ql-italic" aria-label="Italic"></button>
                <button className="ql-underline" aria-label="Underline"></button>
                <button className="ql-strike" aria-label="Strike"></button>
                <button className="ql-list" value="ordered" aria-label="Ordered List"></button>
                <button className="ql-list" value="bullet" aria-label="Unordered List"></button>
                <select className="ql-color" aria-label="Text Color"></select>
                <select className="ql-background" aria-label="Text Background Color"></select>
                <button className="ql-clean" aria-label="Remove Styles"></button>
            </span>
        );
    };
    const header = renderHeader();
    const today = new Date();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() + " " + today.getHours() + ":" + today.getMinutes();

    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [possibleOptions, setPossibleOptions] = useState<any>(null);
    const [characteristic, setCharacteristic] = useState<any>({});
    const [dropdownCharacteristics, setDropdownCharacteristics] = useState<any[]>([]);
    const [characteristics, setCharacteristics] = useState<any[]>([]);
    const [description, setDescription] = useState<any>("");
    const [images2, setImages2] = useState<any[]>([]); 
    const [time_of_day_relevance, setTimeOfDayRelevance] = useState<string>("");
    const dropdownTimeOfDayRelevance = [
        { name: 'All Day', value: 'All Day' },
        { name: 'Morning', value: 'Morning' },
        { name: 'Afternoon', value: 'Afternoon' },
        { name: 'Night', value: 'Night' }
    ];
    const [season_relevance, setSeasonRelevance] = useState<string>("");
    const dropdownSeasonRelevance = [
        { name: 'All Year', value: 'All Year' },
        { name: 'Winter', value: 'Winter' },
        { name: 'Spring', value: 'Spring' },
        { name: 'Summer', value: 'Summer' },
        { name: 'Autumn', value: 'Autumn' }
    ];

    const [images, setImages] = useState<any[]>([]);
    const handleFileUpload = (event: any) => {
        const selectedFiles = event.files;
        // Filter out the removed files from the current selectedFiles
        const remainingFiles = selectedFiles.filter((file: any) => !file.remove);

        // Update the images state with the remaining files
        setImages(remainingFiles);

        // Convert the remaining files to the newImages format
        const newImages = remainingFiles.map((file: File) => ({
            itemImageSrc: URL.createObjectURL(file),
            thumbnailImageSrc: URL.createObjectURL(file),
            alt: file.name
        }));

        // Update the images2 state with the newImages
        setImages2(newImages);
    };

    

    const [selectedCharacteristics, setSelectedCharacteristics] = useState<any>([]);

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
            setCharacteristics(response.data);
        })
        .catch(error => {
            console.log(error);
        });
        
    }, []);

    const [title, setTitle] = useState("");
    const [carouselItemTitle, setCarouselItemTitle] = useState("");
    const [carouselItemSubtitle, setCarouselItemSubtitle] = useState("");
    const [buttonText, setButtonText] = useState("");
    const [carouselItems, setCarouselItems] = useState<any[]>([]);
    const [link, setLink] = useState<any>("");
    useEffect(() => {
        axios.get(`http://localhost:4000/objects/carousel/${params.id}`)
        .then(response => {
            console.log(response.data);
            setTitle(response.data.title);
            setTimeOfDayRelevance(response.data.time_of_day_relevance);
            setSeasonRelevance(response.data.season_relevance);
            const associations = response.data.objectCharacteristicsAssociations;
            console.log("Associations:", associations);
            const selectedCharacteristicsData = associations.map((association: { characteristics: { name: any; }[]; option_selected: any; }) => ({
                characteristic: association.characteristics[0].name,
                selectedOption: association.option_selected
            }));
            console.log("Selected Characteristics:", selectedCharacteristicsData);
            setSelectedCharacteristics(selectedCharacteristicsData);

            const formattedCarousels = [];
            if (response.data && Array.isArray(response.data.items)) {
                const { ID, title, views, created_at } = response.data;
                const formattedItems = response.data.items.map((item: any) => ({
                    ID: item.ID,
                    buttonText: item.buttonText,
                    carouselItemSubtitle: item.subtitle,
                    carouselItemTitle: item.title,
                    description: item.description,
                    image: item.image,
                    link: item.link,
                    title: item.title,
                }));

                const formattedResponse = {
                    ID, // Ensure that each carousel has a unique identifier
                    title,
                    views,
                    created_at,
                    items: formattedItems,
                };

                formattedCarousels.push(formattedResponse);
            }
            
            console.log("Formatted Carousels:", formattedCarousels);
            setCarouselItems(formattedCarousels);
            })
        .catch(error => {
            console.log(error);
        });
        
    }, [params.id]);

    

    const handleAddToList = () => {
        // Check if the characteristic and selectedOption combination already exists
        const isDuplicate = selectedCharacteristics.some(
            (item: any) => item.characteristic === characteristic && item.selectedOption === selectedOption
        );

        // If the combination already exists, do not add it to the list
        if (isDuplicate) {
            alert('This combination already exists in the list.');
            return;
        }
        setSelectedCharacteristics((prevState: any) => [
            ...prevState,
            { characteristic, selectedOption }
        ]);
        // Clear current selection
        setCharacteristic('');
        setSelectedOption('');
        setPossibleOptions([]);
    };

    const handleRemoveFromList = (index: any) => {
        setSelectedCharacteristics((prevState: any[]) =>
            prevState.filter((_: any, i: any) => i !== index)
        );
    };

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

    async function editCarousel() {
        if (carouselItems.length === 0) {
            alert('Please add at least one carousel item.');
            return;
        }
        
        console.log("Carousel Items:", carouselItems); 

        const associationsMap = new Map(); // Use a Map to group selectedOptions by characteristic

        // Group selectedOptions by characteristic
        selectedCharacteristics.forEach(({ characteristic, selectedOption }: { characteristic: any, selectedOption: any }) => {
        if (!associationsMap.has(characteristic)) {
            associationsMap.set(characteristic, []);
        }
        associationsMap.get(characteristic).push(selectedOption);
        });

        // Construct the associations array
        const associations: any[] | undefined = [];
        for (const [characteristic, options] of associationsMap) {
        associations.push({ characteristic, options });
        }

        
        for (const item of carouselItems[0].items) {
            const formData = new FormData(); 
            formData.append('title', carouselItems[0].title);
            formData.append('time_of_day_relevance', time_of_day_relevance);
            formData.append('season_relevance', season_relevance);
            console.log("time_of_day_relevance:", time_of_day_relevance);
            console.log("season_relevance:", season_relevance);
            console.log("Item:", item);
            formData.append('itemID', item.ID);
            formData.append('itemTitle', item.carouselItemTitle);
            formData.append('itemSubtitle', item.carouselItemSubtitle);
            formData.append('itemButtonText', item.buttonText);
            formData.append('itemLink', item.link);
            formData.append('itemDescription', item.description);
            if (Array.isArray(item.image)) {
                formData.append('images', item.image[0]);
            }

            await axios.put(`http://localhost:4000/objects/carousel/${params.id}`, formData)
            .then(response => {
                console.log(response);
            })
            .catch(error => {
                console.log(error);
            });
        }
        axios.put(`http://localhost:4000/objects/associate/carousel/${carouselItems[0].title}`, associations)
            .then(response => {
                console.log(response);
                window.location.href = '/nutritional-interface/objects/carousels';
            })
            .catch(error => {
                console.log(error);
            });
        
        
    }

    async function deleteCarousel() {
        try {
            console.log(params.id)
            const response = await axios.delete(`http://localhost:4000/objects/carousel/${params.id}`);
            console.log(response);
           // window.location.href = '/nutritional-interface/objects/carousels';
        } catch (error) {
            console.log(error);
        }
    }

    function SampleNextArrow(props: any) {
        const { className, style, onClick } = props;
        return (
          <div
            className={className}
            style={{ ...style, display: "block", background: "gray",borderRadius: "50%" }}
            onClick={onClick}
          />
        );
    }
      
      function SamplePrevArrow(props: any) {
        const { className, style, onClick } = props;
        return (
          <div
            className={className}
            style={{ ...style, display: "block", background: "gray",borderRadius: "100%" }}
            onClick={onClick}
          />
        );
    }

    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        fade: true,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />
    };

    const generateUniqueId = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    const handleAddCarouselItem = () => {
        if (!title || images.length === 0 || !carouselItemTitle || !carouselItemSubtitle || !buttonText || !link) {
            alert('Please fill all fields and upload at least one image.');
            return;
        }
    
        // Get the first carousel in the carouselItems array
        const firstCarousel = carouselItems[0];
    
        if (!firstCarousel) {
            alert('No carousel found to add the item to.');
            return;
        }
    
        // Create a new item
        const newItem = {
            ID: generateUniqueId(), // Generate unique ID for the new item
            buttonText,
            carouselItemSubtitle,
            carouselItemTitle,
            description,
            image: images, // Assuming you want to use only the first image
            link
        };
    
        // Update the first carousel's items array by concatenating the new item
        const updatedItems = [...firstCarousel.items, newItem];
    
        // Create a new carousel with the updated items array
        const updatedCarousel = {
            ...firstCarousel,
            items: updatedItems
        };
    
        // Update the carouselItems state with the modified carousel at the same position
        const updatedCarouselItems = carouselItems.map((carousel, index) =>
            index === 0 ? updatedCarousel : carousel
        );
    
        setCarouselItems(updatedCarouselItems);
    
        // Clear input fields
        setCarouselItemTitle('');
        setCarouselItemSubtitle('');
        setButtonText('');
        setLink('');
        setDescription('');
        setImages([]);
    };

   

    const handleRemoveCarouselItem = (carouselId: string, itemId: string) => {
        const confirm = window.confirm('Are you sure you want to delete this item?');
        if (!confirm) {
            return;
        }
        // remove the item from the database
        deleteCarouselItem(carouselId, itemId);
        setCarouselItems(prevCarouselItems => {
            // Create a new array of carousels with the updated items
            const updatedCarousels = prevCarouselItems.map((carousel: any) => {
                if (carousel.ID === carouselId) {
                    // Filter out the item with the specified ID
                    const updatedItems = carousel.items.filter((item: any) => item.ID !== itemId);
                    return { ...carousel, items: updatedItems };
                }
                return carousel;
            });
    
            return updatedCarousels;
        });
    };

    async function deleteCarouselItem(carouselID: string, itemID: string) {
        console.log("Carousel ID:", carouselID);
        console.log("Item ID:", itemID);
        axios.delete(`http://localhost:4000/objects/carousel/${carouselID}?carouselItemID=${itemID}`)
        .then(response => {
            console.log("Responde Carousel Item Delete", response);
        })
        .catch(error => {
            console.log(error);
        });
    }

    return (
        <div className="w-full flex">
            <div className="w-1/5 hidden md:flex">
                <Sidebar  />
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
                text={"Edit Carousel"}
                className="mb-8  mt-8 text-center text-green2 text-4xl lg:text-7xl sm:text-6xl xs:text-4xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                />
                <div className="w-full grid grid-cols-1 gap-2 p-4">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2">
                        <div className="w-full grid grid-cols-1 gap-2 border-2 rounded-xl bg-white whitespace-wrap">
                            <div className="w-full text-center p-4">
                                <h1 className="mt-2 mb-2 font-bold text-xl text-green2">Edit Carousel</h1>
                                <hr className="mb-4" />
                                <div className="w-full grid grid-cols-2 gap-2 p-4">
                                    <div className="w-full p-float-label mt-5">
                                        <InputText readOnly id="title" value={title} onChange={(e) => setTitle(e.target.value)} className='h-12 w-full border-2 border-solid' />
                                        <label htmlFor="title">Carousel Title</label>
                                    </div>
                                    <div className="w-full p-float-label mt-5">
                                        <InputText id="subtitle" value={carouselItemTitle} onChange={(e) => setCarouselItemTitle(e.target.value)} className='h-12 w-full border-2 border-solid' />
                                        <label htmlFor="subtitle">Carousel Item Title</label>
                                    </div>
                                    <div className="w-full p-float-label mt-5">
                                        <InputText id="subtitle" value={carouselItemSubtitle} onChange={(e) => setCarouselItemSubtitle(e.target.value)} className='h-12 w-full border-2 border-solid' />
                                        <label htmlFor="subtitle">Carousel Item Subtitle</label>
                                    </div>
                                    <div></div>
                                </div>
                                <div className="w-full p-4 flex flex-col">
                                    <h1 className="text-start text-black text-opacity-50 mb-1 ml-2">Description</h1>
                                    <Editor value={description} onTextChange={(e) => setDescription(e.htmlValue)} headerTemplate={header} style={{ height: '320px' }} />
                                    <div className="w-full p-float-label mt-5">
                                        <InputText id="subtitle" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className='h-12 w-full border-2 border-solid' />
                                        <label htmlFor="subtitle">Carousel Item Button text</label>
                                    </div>
                                    <div className="w-full p-float-label mt-5">
                                        <InputText id="subtitle" value={link} onChange={(e) => setLink(e.target.value)} className='h-12 w-full border-2 border-solid' />
                                        <label htmlFor="subtitle">Link of the item</label>
                                    </div>
                                </div>
                                <div className='w-full p-4'>
                                    <FileUpload mode="advanced" headerClassName="border-2" contentClassName="border-2" name="images" url={'/api/upload'} accept="image/*" maxFileSize={10000000000000} onSelect={handleFileUpload} emptyTemplate={<p className="w-full m-0">Drag and drop images to here to upload.</p>} />
                                </div>
                                <div className="w-full p-4 text-center mb-4">
                                    <Button onClick={handleAddCarouselItem} label="Add Carousel Item" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised />
                                </div>
                                <div className="w-full p-4 grid grid-cols-1 gap-2">
                                    <h1 className="text-xl font-bold text-green2 ">Carousel Items</h1>
                                    <ul>
                                        {carouselItems.map((carousel: any) => (
                                            <div key={carousel.ID} className="w-full grid grid-cols-3 gap-2 border-2">
                                                {carousel.items.map((item: any) => (
                                                    <React.Fragment key={item.ID}>
                                                        <div className="w-full border-r-2 p-2">{item.carouselItemTitle}</div>
                                                        <div className="w-full border-r-2 p-2">{item.carouselItemSubtitle}</div>
                                                        <div className="w-full p-2">
                                                            <Button onClick={() => handleRemoveCarouselItem(carousel.ID, item.ID)} label="Remove" className='w-3/4 bg-red-500 text-white hover:text-red-500 hover:bg-white' text raised />
                                                        </div>
                                                        <div className="w-full col-span-3"><hr className="w-full" /></div>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        ))}
                                    </ul>
                                </div>
                                <hr className="mb-4" />
                                <div className="w-full flex items-center justify-center text-center mb-4">
                                    <h1 className="text-xl font-bold text-green2 ">Set the Carousel Availability</h1>
                                </div>
                                <div className="w-full flex flex-col">
                                    <div className="w-full p-4">
                                            <div className="w-full text-black text-opacity-60 p-float-label">
                                                <Dropdown 
                                                    value={time_of_day_relevance} 
                                                    onChange={(e) => setTimeOfDayRelevance(e.value)} 
                                                    options={dropdownTimeOfDayRelevance} 
                                                    optionLabel="name" 
                                                    placeholder="Part of the Day to be Available"
                                                    className="w-full h-12 border-2" 
                                                    panelClassName=' mt-1' 
                                                />
                                                <label htmlFor="characteristicName">Part of the Day to be Available</label>   
                                            </div>
                                    </div>
                                    <div className="w-full p-4">
                                            <div className="w-full text-black text-opacity-60 p-float-label">
                                                <Dropdown 
                                                    value={season_relevance} 
                                                    onChange={(e) => setSeasonRelevance(e.value)} 
                                                    options={dropdownSeasonRelevance} 
                                                    optionLabel="name" 
                                                    placeholder="Season to be Available"
                                                    className="w-full h-12 border-2" 
                                                    panelClassName=' mt-1' 
                                                />
                                                <label htmlFor="characteristicName">Season to be Available</label>   
                                            </div>
                                    </div>
                                </div>
                                <h1 className="mt-2 mb-2 font-bold text-green2 text-xl">Update Characteristics of the Object</h1>
                                <div>
                                    {/* Dropdown for selecting characteristic */}
                                    <div className="w-full p-4">
                                        <div className="w-full text-black text-opacity-60 p-float-label">
                                            <Dropdown 
                                                value={characteristic} 
                                                onChange={(e) => setCharacteristic(e.value)} 
                                                options={dropdownCharacteristics} 
                                                optionLabel="name" 
                                                placeholder="Select Characteristic"
                                                filter 
                                                className="w-full h-12 border-2" 
                                                panelClassName=' mt-1' 
                                            />
                                            <label htmlFor="characteristicName">Associate Characteristic</label>   
                                        </div>
                                    </div>
                                    {/* Dropdown for selecting option */}
                                    {possibleOptions && possibleOptions.length > 0 && (
                                        <>
                                            <div className="w-full p-4">
                                                <div className="w-full text-black text-opacity-60 p-float-label">
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
                                            </div>
                                            {selectedOption && selectedOption.length > 0 &&
                                                <div className="w-full p-4 text-center">
                                                    <Button onClick={handleAddToList} label="Add to List" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/>
                                                </div>
                                            }       
                                        </> 
                                    )}
                                    
                                    <div className="w-full p-4 grid grid-cols-1 gap-2">
                                        <h1 className="text-md text-green2 font-bold underline">Table with the characteristics to be collected that are associated with the Article</h1>
                                        <ul>
                                        {selectedCharacteristics.map((item: any, index: any) => (
                                            <div key={index} className="w-full grid grid-cols-3 gap-2 border-2">
                                                <div className="w-full border-r-2 p-2">{item.characteristic}</div>
                                                <div className="w-full border-r-2 p-2">{item.selectedOption}</div>
                                                <div className="w-full p-2"><Button onClick={() => handleRemoveFromList(index)} label="Remove" className=' w-3/4 bg-red-500 text-white hover:text-red-500 hover:bg-white ' text raised/></div>    
                                            </div>        
                                        ))}
                                        </ul>
                                    </div>  
                                </div>
                            </div>
                        </div>
                        <div className="w-full grid grid-cols-1 gap-2 border-2 rounded-xl bg-white whitespace-wrap">
                            <div className="w-full text-center p-4  ">
                                <h1 className="mt-2 mb-2 font-bold text-xl text-green2">Preview</h1>
                                <hr className="mb-4" />
                                <div className="w-full grid grid-cols-1 gap-2 mt-4  p-4">
                                    <div className="w-full flex items-center justify-center flex-col">
                                        {title && 
                                            <div className="w-full mb-4">
                                            <h1 className="w-full text-3xl text-balance text-green2">{title}</h1>
                                        </div>}
                                    </div>
                                    <div className="w-full flex items-center justify-center text-center ">
                                    {carouselItems.length > 0 && (
                                        <div className="w-full text-center p-2">
                                            {carouselItems.map((carousel: any, index: number) => (
                                                <div key={index} className="w-full grid grid-cols-1 gap-2">
                                                    <Slider {...settings}>
                                                        {carousel.items.map((item: any, itemIndex: number) => (
                                                            <React.Fragment key={itemIndex}>
                                                                <div className="w-full grid grid-cols-2 gap-2">
                                                                <div className="w-full grid grid-cols-1 gap-2">
                                                                    <div className="w-full flex flex-col items-center justify-center">
                                                                        <div className="w-full flex flex-col justify-center items-center">
                                                                            <h1 className="text-4xl font-bold text-green2">{item.carouselItemTitle}</h1>
                                                                            <h2 className="text-black text-opacity-55">{item.carouselItemSubtitle}</h2>
                                                                        </div>
                                                                        <a href={item.link} className="w-full flex mt-16 justify-center items-center">
                                                                            <Button label={item.buttonText} className='w-2/3 border-2 rounded-2xl p-2 bg-gray-500 text-white hover:bg-white hover:text-gray-500' text raised/>
                                                                        </a>
                                                                    </div>
                                                                </div> 
                                                                    {Array.isArray(item.image) ? (
                                                                        <img className='w-full h-64 object-cover object-center border-2 rounded-t-full shadow-xl hover:scale-105' src={item.image[0].objectURL} alt={`Image ${index + 1}`} />
                                                                    ) : (
                                                                        <img className='w-full h-64 oobject-cover object-center border-2 rounded-t-full shadow-xl hover:scale-105' src={item.image} alt={`Image ${index + 1}`} />
                                                                    )}
                                                                    
                                                                </div>
                                                                <div className="w-full mt-4" dangerouslySetInnerHTML={{ __html: item.description }} />
                                                            </React.Fragment>
                                                        ))}
                                                    </Slider>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    </div>
                                    <div className="w-full mt-3">
                                        <p className="text-md text-end text-black text-opacity-50">Created at {date} </p>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full text-left flex flex-row">
                        <Button onClick={editCarousel} label="Edit Carousel" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/> 
                        <Button onClick={deleteCarousel} label="Delete Carousel" className='mx-2 p-3 bg-red-500 text-white hover:bg-white hover:text-red-500 ' text raised/>
                    </div>
                </div>
            </div>
        </div>
    );
}