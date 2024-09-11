"use client";
import { useTranslation } from "@wac/app/i18n/client";
import AnimatedText from "@wac/app/[lng]/components/animatedText/AnimatedText";
import { MenuItem } from 'primereact/menuitem';
import Sidebar from "@wac/app/[lng]/components/sidebar/Sidebar";
import { Button } from 'primereact/button';
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Dropdown } from 'primereact/dropdown';
import MathEquation from "@wac/app/[lng]/components/katex/MathEquation";
import { Editor } from 'primereact/editor';
  


interface PropsType {
    params: { lng: string };
}


export default function createCalculator({ params: { lng } }: PropsType) {

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


    const [variableToCalculate, setVariableToCalculate] = useState<string>(""); // State for the variable to calculate
    const [equation, setEquation] = useState<string>(""); // State for the equation
    const [variables, setVariables] = useState<string[]>([]); // State for storing variables
    const [variableValues, setVariableValues] = useState<{ [key: string]: string }>({}); // State for storing variable values
    const [result, setResult] = useState<string>(""); // State for storing the result

    
    // Function to parse the equation and extract variables
    useEffect(() => {
        // Parse the equation string to extract variable names
        const extractedVariables = equation
            .replace(/=/g, '') // Remove equal sign
            .match(/\b[a-zA-Z]+\([^)]*\)|\b[a-zA-Z]+\b/g) || []; // Match words followed by parentheses or standalone words

        // Remove duplicates and update state
        setVariables(Array.from(new Set(extractedVariables)));
    }, [equation]);

    async function calculateResult() {
        console.log("Variables:", variables);
        // Replace variables in the equation with their values
        let calculatedEquation = equation;
    
        // Loop through each variable and its corresponding value
        for (const [variableWithUnit, value] of Object.entries(variableValues)) {
            console.log("Variable with unit:", variableWithUnit);
            // Extract variable name and unit
            const matches = variableWithUnit.match(/(.+)\(([^)]+)\)/);
            console.log("Matches:", matches);
            if (matches && matches.length === 3) {
                const variableName = matches[1].trim();
                const unit = matches[2].trim();
                const regex = new RegExp(`\\b${variableWithUnit}\\b`, 'g');
                // Replace the variable with its value, without the unit
                calculatedEquation = calculatedEquation.replace(regex, value);
                calculatedEquation = calculatedEquation.replace(new RegExp(`\\b${variableName}\\b`, 'g'), value);
                // Remove both the unit and associated parentheses
                calculatedEquation = calculatedEquation.replace(new RegExp(`\\(${unit}\\)`, 'g'), '');
            }
        }
    
        // Replace '^' with '**' for exponentiation
        calculatedEquation = calculatedEquation.replace(/\^/g, '**');
    
        console.log("Calculated equation before evaluation:", calculatedEquation);
    
        // Evaluate the calculated equation
        try {
            const calculatedResult = eval(calculatedEquation);
            setResult(calculatedResult.toString());
        } catch (error) {
            console.error("Error during evaluation:", error);
            setResult("Error");
        }
    }

    // Function to handle variable value changes
    const handleVariableChange = (variable: string, value: string) => {
        setVariableValues({ ...variableValues, [variable]: value });
    };

    // Handler for equation change
    const handleEquationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEquation(e.target.value);
    };

    const { t } = useTranslation(lng, "home");
    const today = new Date();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() + " " + today.getHours() + ":" + today.getMinutes();

    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [possibleOptions, setPossibleOptions] = useState<any>(null);
    const [characteristic, setCharacteristic] = useState<any>({});
    const [dropdownCharacteristics, setDropdownCharacteristics] = useState<any[]>([]);
    const [characteristics, setCharacteristics] = useState<any[]>([]);
    const [title, setTitle] = useState<string>("");
    const [subtitle, setSubtitle] = useState<string>("");
    const [description, setDescription] = useState<any>("");
    const [text, setText] = useState<string>('');
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

    async function createCalculator() {
        if (!title || !subtitle || !description || !images || !equation || !variableToCalculate) {
            alert('Please fill in all fields');
            return;
        }
        const data = new FormData();
        data.append('title', title);
        data.append('subtitle', subtitle);
        data.append('description', description);
        data.append('equation', equation);
        data.append('images', images[0]);
        data.append('variable_to_calculate', variableToCalculate);
        data.append('time_of_day_relevance', time_of_day_relevance);
        data.append('season_relevance', season_relevance);

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

        console.log(associations);

        
        try {
            axios.post('http://localhost:4000/objects/calculator', data)
            .then(response => {
                console.log(response);
                if(associations.length > 0){
                    axios.post(`http://localhost:4000/objects/associate/calculator/${title}`, associations)
                    .then(response => {
                        console.log(response);
                        window.location.href = '/nutritional-interface/objects/calculators';
                    })
                    .catch(error => {
                        console.log(error);
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
        } catch (error) {
            console.log(error);
        }
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
                text={"Create Calculator"}
                className="mb-8  mt-8 text-center text-green2 text-4xl lg:text-7xl sm:text-6xl xs:text-4xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                />
                <div className="w-full grid grid-cols-1 gap-2 p-4">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2">
                        <div className="w-full grid grid-cols-1 gap-2 border-2 rounded-xl bg-white whitespace-wrap">
                            <div className="w-full text-center p-4">
                                <h1 className="mt-2 mb-2 font-bold text-xl text-green2">Create Calculator</h1>
                                <hr className="mb-4" />
                                <div className="w-full grid grid-cols-2 gap-2 p-4">
                                    <div className="w-full p-float-label mt-5">
                                        <InputText id="title" value={title} onChange={(e) => setTitle(e.target.value)} className='h-12 w-full border-2 border-solid'  />
                                        <label htmlFor="title">Calculator Title</label>
                                    </div>
                                    <div className="w-full p-float-label mt-5">
                                        <InputText id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className='h-12 w-full border-2 border-solid'  />
                                        <label htmlFor="subtitle">Calculator Subtitle</label>
                                    </div>
                                </div>
                                {/* <div className="w-full p-4">
                                    <div className="w-full p-float-label">
                                        <InputTextarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} cols={30} className='w-full border-2 rounded-xl min-h-full' />
                                        <label htmlFor="description">Description</label>
                                    </div>
                                </div> */}
                                <div className="w-full p-4 flex flex-col">
                                    <Editor value={description} onTextChange={(e) => setDescription(e.htmlValue)} headerTemplate={header} style={{ height: '320px' }} />
                                </div>
                                <div className="w-full grid grid-cols-1 gap-1 p-4">
                                    <div className="w-full grid grid-cols-5">
                                        <div className="w-full col-span-1">
                                            <div className="w-full p-float-label">
                                                <InputText
                                                    id="variableToCalculate"
                                                    value={variableToCalculate}
                                                    onChange={(e) => setVariableToCalculate(e.target.value)}
                                                    className='h-12 w-full border-2 border-solid'
                                                />
                                                <label htmlFor="variableToCalculate">Variable</label>
                                            </div>
                                        </div>
                                        <div className="w-full col-span-1 flex items-center justify-center">
                                            <span className="text-xl">=</span>
                                        </div>
                                        <div className="w-full col-span-3">
                                            <div className="w-full  p-float-label">
                                                <InputText
                                                    id="equation"
                                                    keyfilter={/^[^ ]*$/}
                                                    value={equation}
                                                    onChange={handleEquationChange} // Bind the handler here
                                                    className='h-12 w-full border-2 border-solid'
                                                />
                                                <label htmlFor="equation">Enter Equation</label>
                                            </div>
                                        </div>
                                    </div>  
                                    {variableToCalculate &&
                                        <div className="w-full grid grid-cols-1 mt-4 bg-gray-200 p-2 border-2 rounded-xl">
                                            <div className="w-full flex items-center justify-center">
                                                <span className="text-xl">{variableToCalculate}</span>
                                            </div>
                                            <div className="w-full flex items-center justify-center">
                                                <span className="text-xl">=</span>
                                            </div>
                                            <div className="w-full whitespace-wrap">
                                                <div className="w-full p-float-label">
                                                    <MathEquation equation={equation} inline={false} />
                                                </div>
                                            </div>
                                        </div>
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
                                <div className='w-full p-4'>
                                    <FileUpload mode="advanced" headerClassName="border-2" contentClassName="border-2" name="images" url={'/api/upload'} accept="image/*" maxFileSize={10000000000000} onSelect={handleFileUpload} emptyTemplate={<p className="w-full m-0">Drag and drop images to here to upload.</p>} />
                                </div>
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
                                        <h1 className="text-xl font-bold text-green2 ">Seletected Characteristics and Options to associate with the object</h1>
                                        <ul>
                                            {selectedCharacteristics.map((item: any, index: any) => (
                                                <div className="w-full grid grid-cols-3 gap-2 border-2">
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
                                <div className="w-full grid grid-cols-1 gap-2 rounded-xl mt-4  p-4">
                                    <div className="w-full grid grid-cols-2 gap-4 mb-8">
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
                                        {images.length > 0 && 
                                            <div className="w-full hover:scale-105">
                                                <Image
                                                    className='w-full object-cover border-2 rounded-l-full mt-1 drop-shadow-xl'
                                                    src={images[0].objectURL}
                                                    alt={'Article Image'}
                                                    width={500}
                                                    height={500}
                                                    priority={true}
                                                />
                                            </div>
                                        }
                                    </div>
                                    {variables.map(variable => (
                                        <div key={variable} className="mb-4 w-full flex flex-col items-center justify-center">
                                            <div className="w-1/3 flex flex-col text-sm">
                                                <label htmlFor={variable}>Insert <span className="font-bold">{variable}</span>:</label>
                                                <InputText
                                                    id={variable}
                                                    keyfilter="num"
                                                    value={variableValues[variable] || ''}
                                                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                    className='h-12 w-full border-2 border-solid'
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {variables.length > 0 &&
                                        <div className="w-full">
                                            <Button onClick={calculateResult} label="Calculate" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/>
                                        </div>
                                    }
                                    {result && 
                                        <div className="w-full grid grid-cols-1 gap-4 px-16">
                                            <div className="w-full flex flex-col items-center justify-center text-left bg-gray-100 p-4 border-2 rounded-xl hover:scale-105">
                                                <div className="w-full text-sm text-black text-opacity-75">Result:</div>
                                                <div className="w-full text-2xl text-green2">{result}</div>
                                            </div>
                                        </div>
                                    }
                                    <div className="w-full">
                                        <p className="text-md text-end text-black text-opacity-50">Created at {date} </p>
                                    </div>
                                    {description && 
                                        <div className="w-full grid grid-cols-1 gap-4 px-16 mt-24">
                                            <div className="w-full flex items-center justify-center text-left  p-4 border-2 rounded-xl hover:scale-105">
                                                <div className="w-full" dangerouslySetInnerHTML={{ __html: formatDescriptionHTML(description) }} />
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full text-center">
                        <Button onClick={createCalculator} label="Create" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/> 
                    </div>
                </div>
            </div>
        </div>
    );
}