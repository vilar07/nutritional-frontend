"use client";
import { useTranslation } from "@wac/app/i18n/client";
import AnimatedText from "@wac/app/[lng]/components/animatedText/AnimatedText";
import { MenuItem } from 'primereact/menuitem';
import Sidebar from "@wac/app/[lng]/components/sidebar/Sidebar";
import { Button } from 'primereact/button';
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Dropdown } from 'primereact/dropdown';
import { Editor } from 'primereact/editor';

interface PropsType {
    params: { id: string; lng?: string }; // Making lng optional
}

export default function editArticle({ params }: PropsType) {

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
                {/* <select className="ql-align" defaultValue="center" aria-label="Text Alignment" > 
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                </select> */}

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
    const [imgURL, setImgURL] = useState<any>('');
    const [characteristics, setCharacteristics] = useState<any[]>([]);
    const [title, setTitle] = useState<string>("");
    const [subtitle, setSubtitle] = useState<string>("");
    const [description, setDescription] = useState<any>("");
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
        setImages(selectedFiles);
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

    useEffect(() => {
        axios.get(`http://localhost:4000/objects/article/${params.id}`)
        .then(response => {
            console.log("Artigo:",response.data);
            setTitle(response.data.title);
            setSubtitle(response.data.subtitle);
            setDescription(response.data.description);
            setTimeOfDayRelevance(response.data.time_of_day_relevance);
            setSeasonRelevance(response.data.season_relevance);
            setImgURL(response.data.image);
            const associations = response.data.objectCharacteristicsAssociations;
            const selectedCharacteristicsData = associations.map((association: { characteristics: { name: any; }[]; option_selected: any; }) => ({
                characteristic: association.characteristics[0].name,
                selectedOption: association.option_selected
            }));
            console.log("Selected Characteristics:", selectedCharacteristicsData);
            setSelectedCharacteristics(selectedCharacteristicsData);
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

    async function editArticle() {
        if (!title || !subtitle || !description || !time_of_day_relevance || !season_relevance) {
            alert('Please fill in all fields');
            return;
        }
        const data = new FormData();
        data.append('title', title);
        data.append('subtitle', subtitle);
        data.append('description', description);
        data.append('time_of_day_relevance', time_of_day_relevance);
        data.append('season_relevance', season_relevance);
        if (images.length > 0){
            data.append('image', images[0]);
        }

        const associationsMap = new Map(); // Use a Map to group selectedOptions by characteristic

        // Group selectedOptions by characteristic
        selectedCharacteristics.forEach(({ characteristic, selectedOption }: { characteristic: any, selectedOption: any }) => {
        if (!associationsMap.has(characteristic)) {
            associationsMap.set(characteristic, []);
        }
        associationsMap.get(characteristic).push(selectedOption);
        });

        // Construct the associations array
        const associations = [];
        for (const [characteristic, options] of associationsMap) {
        associations.push({ characteristic, options });
        }
     
        try {
            const response = await axios.put(`http://localhost:4000/objects/article/${params.id}`, data);
            console.log(response);
            
            const response2 = await axios.put(`http://localhost:4000/objects/associate/article/${title}`, associations);
            console.log('Association response:', response2.data);
    
            // Optionally, redirect after all API calls are done
            window.location.href = '/nutritional-interface/objects/articles';
        } catch (error) {
            console.log(error);
        }
    }

    async function deleteArticle() {
        try {
            const response = await axios.delete(`http://localhost:4000/objects/article/${params.id}`);
            console.log(response);
            window.location.href = '/nutritional-interface/objects/articles';
        } catch (error) {
            console.log(error);
        }
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
            text={"Edit Article"}
            className="mb-8  mt-8 text-center text-green2 text-4xl lg:text-7xl sm:text-6xl xs:text-4xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
            />
                <div className="w-full grid grid-cols-1 gap-2 p-4">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2">
                        <div className="w-full grid grid-cols-1 gap-2 border-2 rounded-xl bg-white">
                            <div className="w-full text-center p-4">
                                <h1 className="mt-2 mb-2 font-bold text-xl text-green2">Edit Article</h1>
                                <hr className="mb-4" />
                                <div className="w-full grid grid-cols-2 gap-2 p-4">
                                    <div className="w-full p-float-label mt-5">
                                        <InputText id="title" value={title} onChange={(e) => setTitle(e.target.value)} className='h-12 w-full border-2 border-solid'  />
                                        <label htmlFor="title">Article Title</label>
                                    </div>
                                    <div className="w-full p-float-label mt-5">
                                        <InputText id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className='h-12 w-full border-2 border-solid'  />
                                        <label htmlFor="subtitle">Article Subtitle</label>
                                    </div>
                                </div>
                                <div className="w-full p-4 flex flex-col">
                                {description &&
                                    <Editor 
                                        value={description} // Set the value prop to the description state
                                        onTextChange={(e) => setDescription(e.htmlValue)}  // Use the custom function to update editorValue state
                                        headerTemplate={header} // Use the provided header template
                                        style={{ height: '320px' }} 
                                    />
                                }
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
                                <div className='w-full p-4 grid grid-cols-1'>
                                    <div className="w-full p-4">
                                        <div className="w-full ">
                                            <h1 className="text-xl font-bold text-green2 ">Select a new image if you want to change the existent one</h1>
                                        </div>
                                    </div>
                                    <FileUpload mode="advanced" headerClassName="border-2" contentClassName="border-2" name="images" url={'/api/upload'} accept="image/*" maxFileSize={10000000000000} onSelect={handleFileUpload} emptyTemplate={<p className="w-full m-0">Drag and drop images to here to upload.</p>} />
                                </div>
                                <div>
                                    {/* Dropdown for selecting characteristic */}
                                    <div className="w-full p-4 grid grid-cols-1 ">
                                        <div className="w-full p-4">
                                            <div className="w-full ">
                                                <h1 className="text-xl font-bold text-green2 ">Choose Characteristis to be associated with the article</h1>
                                            </div>
                                        </div>
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
                                            <label htmlFor="characteristicName">Characteristic</label>   
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
                                        <h1 className="text-xl font-bold text-green2 ">Table with the characteristics to be collected that are associated with the Article</h1>
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
                            <div className="w-full text-center p-4 ">
                                <h1 className="mt-2 mb-2 font-bold text-xl text-green2">Preview</h1>
                                <hr className="mb-4"/>
                                <div className="w-full grid grid-cols-2 gap-4">
                                    <div className="w-full flex items-center justify-center flex-col">
                                        {title && 
                                            <div className="w-full mb-4">
                                            <h1 className="w-full text-3xl text-balance text-green2">{title}</h1>
                                        </div>}
                                        {/* {title && <AnimatedText text={title} className="text-2xl mt-6" />} */}
                                        {subtitle &&
                                            <div className="w-full text-sm text-black text-opacity-60">
                                            <p>{subtitle}</p>
                                        </div>}
                                    </div>
                                    {imgURL && 
                                        <div className="w-full hover:scale-105">
                                            <Image
                                                className='w-full object-cover border-2 rounded-l-full mt-1 drop-shadow-xl'
                                                src={imgURL}
                                                alt={'Article Image'}
                                                width={500}
                                                height={500}
                                                priority={true}
                                            />
                                        </div>
                                    }
                                </div>
                                <div className="w-full mt-2">
                                    <p className="text-md text-end text-black text-opacity-50">Created at {date} </p>
                                </div>
                                {description && 
                                <div className="w-full grid grid-cols-1 gap-4 px-8 mt-24">
                                    <div className="w-full flex items-center justify-center text-left  p-4 border-2 rounded-xl shadow-lg">
                                        <div className="w-full" dangerouslySetInnerHTML={{ __html: formatDescriptionHTML(description) }} />
                                    </div>
                                </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="w-full text-left flex flex-row">
                        <Button onClick={editArticle} label="Edit Article" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/> 
                        <Button onClick={deleteArticle} label="Delete Article" className='mx-2 p-3 bg-red-500 text-white hover:bg-white hover:text-red-500 ' text raised/>
                    </div>
                </div>
            </div>
        </div>
    );
}