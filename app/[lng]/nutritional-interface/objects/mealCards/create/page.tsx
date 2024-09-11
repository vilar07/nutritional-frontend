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
import { FileUpload } from 'primereact/fileupload';
import { Dropdown } from 'primereact/dropdown';
import { Editor } from "primereact/editor";
import { Checkbox } from 'primereact/checkbox';

interface PropsType {
    params: { lng: string };
}

export default function createMealCard({ params: { lng } }: PropsType) {
    useEffect(() => {
        const isAdmin = localStorage.getItem("isAdmin");
        // If not Admin, alert and redirect to home
        if (isAdmin === "false") {
            alert("You are not an Admin.");
            window.location.href = "/";
        }
    }, []); // Empty dependency array ensures the effect runs only once
    
    const { t } = useTranslation(lng, "home");
    const today = new Date();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() + " " + today.getHours() + ":" + today.getMinutes();

    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [possibleOptions, setPossibleOptions] = useState<any>(null);
    const [characteristic, setCharacteristic] = useState<any>(null);
    const [dropdownCharacteristics, setDropdownCharacteristics] = useState<any[]>([]);
    const [characteristics, setCharacteristics] = useState<any[]>([]);
    const [title, setTitle] = useState<string>("");
    const [subtitle, setSubtitle] = useState<string>("");
    const [description, setDescription] = useState<any>("");

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
        if (!characteristic) {
            return;
        }
        axios.get(`http://localhost:4000/characteristics/characteristics/${characteristic}`)
        .then(response => {
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

    const [categories, setCategories] = useState<any>([]);
    const [showCheckboxesCategories, setShowCheckboxesCategories] = useState(true);
    const onCategoriesChange = (e: any) => {
        let _categories = [...categories];

        if (e.checked)
            _categories.push(e.value);
        else
            _categories.splice(_categories.indexOf(e.value), 1);

        console.log("Categories:", _categories);
        setCategories(_categories);
    }

    const [allergies, setAllergies] = useState<any>([]);
    const [showCheckboxesAllergies, setShowCheckboxesAllergies] = useState(true);
    const onAllergiesChange = (e: any) => {
        let _allergies = [...allergies];

        if (e.checked)
            _allergies.push(e.value);
        else
            _allergies.splice(_allergies.indexOf(e.value), 1);

        console.log("Allergies:", _allergies);
        setAllergies(_allergies);
    }

    const [diseases, setDiseases] = useState<any>([]);
    const [showCheckboxesDiseases, setShowCheckboxesDiseases] = useState(false);
    const onDiseasesChange = (e: any) => {
        let _diseases = [...diseases];

        if (e.checked)
            _diseases.push(e.value);
        else
            _diseases.splice(_diseases.indexOf(e.value), 1);

        console.log("Diseases:", _diseases);
        setDiseases(_diseases);
    }

    const [diets, setDiets] = useState<any>([]);
    const [showCheckboxesDiets, setShowCheckboxesDiets] = useState(false);
    const onDietsChange = (e: any) => {
        let _diets = [...diets];

        if (e.checked)
            _diets.push(e.value);
        else
            _diets.splice(_diets.indexOf(e.value), 1);

        console.log("Diets:", _diets);
        setDiets(_diets);
    }

    const [recipes, setRecipes] = useState<any[]>([]);
    useEffect(() => {
        setRecipes([]);
        const params = [];
    
        if (categories.length > 0) {
            params.push(`categories=${categories.join(',')}`);
        }
    
        if (allergies.length > 0) {
            params.push(`allergies=${allergies.join(',')}`);
        }

        if (diseases.length > 0) {
            params.push(`diseases=${diseases.join(',')}`);
        }

        if (diets.length > 0) {
            params.push(`diets=${diets.join(',')}`);
        }
    
        const queryParams = params.length > 0 ? `?${params.join('&')}` : '';
    
        axios.get(`http://localhost:8010/proxy/recipes${queryParams}`)
            .then(response => {
                console.log("Recipes: ", response.data.recipes);
                setRecipes(response.data.recipes);
            })
            .catch(error => {
                console.log(error);
            });
    }, [categories, allergies, diseases, diets]);

    const [recipeSelected, setRecipeSelected] = useState<any>(null);
    async function selectRecipe(name: string, category: string, description: string, price: number, image: string, total_ingredients: number, id: number) {
        console.log ("Recipe Selected: ", name, category, description, price, image, total_ingredients, id);
        setRecipeSelected({ name, category, description, price, image, total_ingredients, id });
    }

    async function createMealCard() {
        if (recipeSelected === null) {
            alert('Please fill in all fields');
            return;
        }
        const data = new FormData();
        data.append('title', recipeSelected.name);
        data.append('price', recipeSelected.price);
        data.append('description', recipeSelected.description);
        data.append('category', recipeSelected.category);
        data.append('number_ingredients', recipeSelected.total_ingredients);
        data.append('image', recipeSelected.image);
        data.append('link', `https://wishandcook.com/pt/recipes/${recipeSelected.id}`);

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
            axios.post('http://localhost:4000/objects/mealCard', data)
            .then(response => {
                console.log(response);
                axios.post(`http://localhost:4000/objects/associate/mealCard/${recipeSelected.name}`, associations)
                .then(response => {
                    console.log(response);
                    window.location.href = '/nutritional-interface/objects/mealCards';
                })
                .catch(error => {
                    console.log(error);
                });
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
                text={"Create Meal Card"}
                className="mb-8  mt-8 text-center text-green2 text-4xl lg:text-7xl sm:text-6xl xs:text-4xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                />
                <div className="w-full grid grid-cols-1 gap-2 px-4">
                    <div className="w-full flex justify-start items-center">
                        <h1 className="text-2xl text-black text-opacity-50 ">Select a Recipe</h1>
                    </div>
                    <hr/>
                    {recipeSelected === null ? (
                        <div className="w-full grid grid-cols-4 gap-1 mt-4">
                            <div className="w-full grid grid-cols-1 gap-3">
                                <button className="flex flex-row text-lg items-center font-bold text-green2 text-opacity-55" onClick={() => setShowCheckboxesCategories(!showCheckboxesCategories)}>
                                    Recipes Categories 
                                    {/* Conditionally render different icon based on showCheckboxesCategories state */}
                                    {showCheckboxesCategories ? (
                                        <i className="pi pi-chevron-up ml-2"></i>
                                    ) : (
                                        <i className="pi pi-chevron-down ml-2"></i>
                                    )}
                                </button>
                                {showCheckboxesCategories && (
                                    <>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="rice" onChange={onCategoriesChange} checked={categories.includes('rice')} />
                                        <label htmlFor="ingredient1" className="ml-2">Rice</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="soup" onChange={onCategoriesChange} checked={categories.includes('soup')} />
                                        <label htmlFor="ingredient1" className="ml-2">Soup</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="risotto" onChange={onCategoriesChange} checked={categories.includes('risotto')} />
                                        <label htmlFor="ingredient1" className="ml-2">Risotto</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="pasta" onChange={onCategoriesChange} checked={categories.includes('pasta')} />
                                        <label htmlFor="ingredient1" className="ml-2">Pasta</label>
                                    </div>
                                    </>
                                )}
                                <button className="flex flex-row text-lg items-center font-bold text-green2 text-opacity-55" onClick={() => setShowCheckboxesAllergies(!showCheckboxesAllergies)}>
                                    Allergies
                                    {/* Conditionally render different icon based on showCheckboxesCategories state */}
                                    {showCheckboxesAllergies ? (
                                        <i className="pi pi-chevron-up ml-2"></i>
                                    ) : (
                                        <i className="pi pi-chevron-down ml-2"></i>
                                    )}
                                </button>
                                {showCheckboxesAllergies && (
                                    <>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="celery" onChange={onAllergiesChange} checked={allergies.includes('celery')} />
                                        <label htmlFor="ingredient1" className="ml-2">Celery</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="milk" onChange={onAllergiesChange} checked={allergies.includes('milk')} />
                                        <label htmlFor="ingredient1" className="ml-2">Milk</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="egg" onChange={onAllergiesChange} checked={allergies.includes('egg')} />
                                        <label htmlFor="ingredient1" className="ml-2">Egg</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="fish" onChange={onAllergiesChange} checked={allergies.includes('fish')} />
                                        <label htmlFor="ingredient1" className="ml-2">Fish</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="gluten" onChange={onAllergiesChange} checked={allergies.includes('gluten')} />
                                        <label htmlFor="ingredient1" className="ml-2">Gluten</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="mustard" onChange={onAllergiesChange} checked={allergies.includes('mustard')} />
                                        <label htmlFor="ingredient1" className="ml-2">Mustard</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="nuts" onChange={onAllergiesChange} checked={allergies.includes('nuts')} />
                                        <label htmlFor="ingredient1" className="ml-2">Nuts</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="peanut" onChange={onAllergiesChange} checked={allergies.includes('peanut')} />
                                        <label htmlFor="ingredient1" className="ml-2">Peanut</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="sesame+seeds" onChange={onAllergiesChange} checked={allergies.includes('sesame+seeds')} />
                                        <label htmlFor="ingredient1" className="ml-2">Sesame Seeds</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="shellfish" onChange={onAllergiesChange} checked={allergies.includes('shellfish')} />
                                        <label htmlFor="ingredient1" className="ml-2">Shellfish</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="soy" onChange={onAllergiesChange} checked={allergies.includes('soy')} />
                                        <label htmlFor="ingredient1" className="ml-2">Soy</label>
                                    </div>
                                    </>
                                )}
                                <button className="flex flex-row text-lg items-center font-bold text-green2 text-opacity-55" onClick={() => setShowCheckboxesDiseases(!showCheckboxesDiseases)}>
                                    Diseases
                                    {/* Conditionally render different icon based on showCheckboxesCategories state */}
                                    {showCheckboxesDiseases ? (
                                        <i className="pi pi-chevron-up ml-2"></i>
                                    ) : (
                                        <i className="pi pi-chevron-down ml-2"></i>
                                    )}
                                </button>
                                {showCheckboxesDiseases && (
                                    <>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="celiac+disease" onChange={onDiseasesChange} checked={diseases.includes('celiac+disease')} />
                                        <label htmlFor="ingredient1" className="ml-2">Celiac Desease</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="lactose+intolerance" onChange={onDiseasesChange} checked={diseases.includes('lactose+intolerance')} />
                                        <label htmlFor="ingredient1" className="ml-2">Lactose Intolerance</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="gastric+ulcer" onChange={onDiseasesChange} checked={diseases.includes('gastric+ulcer')} />
                                        <label htmlFor="ingredient1" className="ml-2">Gastric Ulcer</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="gastritis" onChange={onDiseasesChange} checked={diseases.includes('gastritis')} />
                                        <label htmlFor="ingredient1" className="ml-2">Gastritis</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="jaundice" onChange={onDiseasesChange} checked={diseases.includes('jaundice')} />
                                        <label htmlFor="ingredient1" className="ml-2">Jaundice</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="hepatical+cirrhosis" onChange={onDiseasesChange} checked={diseases.includes('hepatical+cirrhosis')} />
                                        <label htmlFor="ingredient1" className="ml-2">Hepatical Cirrhosis</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="canker+sores" onChange={onDiseasesChange} checked={diseases.includes('canker+sores')} />
                                        <label htmlFor="ingredient1" className="ml-2">Canker Sores</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="gout" onChange={onDiseasesChange} checked={diseases.includes('gout')} />
                                        <label htmlFor="ingredient1" className="ml-2">Gout</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="hypertension" onChange={onDiseasesChange} checked={diseases.includes('hypertension')} />
                                        <label htmlFor="ingredient1" className="ml-2">Hypertension</label>
                                    </div>
                                    </>
                                )}
                                <button className="flex flex-row text-lg items-center font-bold text-green2 text-opacity-55" onClick={() => setShowCheckboxesDiets(!showCheckboxesDiets)}>
                                    Diets
                                    {/* Conditionally render different icon based on showCheckboxesCategories state */}
                                    {showCheckboxesDiets ? (
                                        <i className="pi pi-chevron-up ml-2"></i>
                                    ) : (
                                        <i className="pi pi-chevron-down ml-2"></i>
                                    )}
                                </button>
                                {showCheckboxesDiets && (
                                    <>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="vegan" onChange={onDietsChange} checked={diets.includes('vegan')} />
                                        <label htmlFor="ingredient1" className="ml-2">Vegan</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="vegetarian" onChange={onDietsChange} checked={diets.includes('vegetarian')} />
                                        <label htmlFor="ingredient1" className="ml-2">Vegetarian</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="gluten+free" onChange={onDietsChange} checked={diets.includes('gluten+free')} />
                                        <label htmlFor="ingredient1" className="ml-2">Gluten Free</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="low+carb" onChange={onDietsChange} checked={diets.includes('low+carb')} />
                                        <label htmlFor="ingredient1" className="ml-2">Low Carb</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="low+fat" onChange={onDietsChange} checked={diets.includes('low+fat')} />
                                        <label htmlFor="ingredient1" className="ml-2">Low Fat</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="low+sodium" onChange={onDietsChange} checked={diets.includes('low+sodium')} />
                                        <label htmlFor="ingredient1" className="ml-2">Low Sodium</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="ingredient1" name="rice" value="low+calories" onChange={onDietsChange} checked={diets.includes('low+calories')} />
                                        <label htmlFor="ingredient1" className="ml-2">Low Calories</label>
                                    </div>
                                    </>
                                )}
                            </div> 
                            <div className="w-full col-span-3 grid grid-cols-2 gric-cols-3 gap-2 overflow-y-scroll">
                                {recipes && recipes.length > 0 && recipes.map((recipe: any, index: any) => (
                                    <div key={index} className="w-full grid grid-cols-1 gap-2 border-2 rounded-xl p-2 h-72">
                                        <div className="w-full flex items-center justify-center">
                                            <a href={`https://wishandcook.com/pt/recipes/${recipe.id}`} target="_blank">
                                                <Image className="border-2 shadow-xl rounded-full" src={recipe.image} alt="recipe" width={150} height={150} priority />
                                            </a>
                                            
                                        </div>
                                        <div className="w-full flex items-center justify-center">
                                            <h1 className="text-md text-center">{recipe.name}</h1>
                                        </div>
                                        <div className="w-full flex items-center justify-center">
                                            <Button onClick={() => selectRecipe(recipe.name, recipe.category, recipe.description, recipe.price, recipe.image, recipe.total_ingredients, recipe.id)} label="Select" className='p-2 bg-gray-500 text-white hover:bg-white hover:text-gray-500 border-2 rounded-xl ' text raised/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full grid grid-cols-1 gap-2">
                            <div className="w-full flex justify-start items-center">
                                <Button label="Change Recipe" onClick={() => setRecipeSelected(null)} className='p-2 bg-gray-500 text-white hover:bg-white hover:text-gray-500 border-2 rounded-xl ' text raised/>
                            </div>   
                            <div className="w-full flex-col justify-center lg:justify-start items-center">
                                <h1 className="text-2xl text-black text-opacity-50">Recipe Selected</h1>
                                {recipeSelected && (
                                    <div  className="w-full lg:w-1/2 grid grid-cols-1 gap-2 border-2 rounded-xl p-2">
                                        <div className="w-full flex items-center justify-center">
                                            <Image className="border-2 shadow-xl rounded-full" src={recipeSelected.image} alt="recipe" width={150} height={150} priority />
                                        </div>
                                        <div className="w-full flex items-center justify-center">
                                            <h1 className="text-xl font-bold text-green2 text-center">{recipeSelected.name}</h1>
                                        </div>
                                        <div className="w-full flex items-center justify-center">
                                            <h1 className="text-md text-center text-black text-opacity-50 font-bold">Category: {recipeSelected.category}</h1>
                                        </div>
                                        <div className="w-full flex items-center justify-center">
                                            <h1 className="text-md text-center">{recipeSelected.description}</h1>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <hr className="my-2"/>
                            <div className="w-full flex-col justify-start items-center">
                                <h1 className="text-2xl text-black text-opacity-50">Associate Characteristics</h1>
                            </div>
                            <div className="w-full lg:w-1/2">
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
                                    <h1 className="text-md underline">Seletected Characteristics and Options to associate with the object</h1>
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
                            <div className="w-full flex items-center justify-start">
                                <Button onClick={createMealCard} label="Create" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/> 
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}