"use client";
import { useTranslation } from "@wac/app/i18n/client";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Rating2 from '@mui/material/Rating';
import { ProgressBar } from "primereact/progressbar";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { motion } from 'framer-motion';
import { FaRegLaughWink} from "react-icons/fa";
import { useMediaQuery } from 'react-responsive';


interface PropsType {
    params: { id: string; lng?: string }; // Making lng optional
}

export default function article({ params }: PropsType) {

    const isMdScreen = useMediaQuery({ query: '(min-width: 768px)' });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [recommendedCharacteristics, setRecommendedCharacteristics] = useState<any[]>([]);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [allergies, setAllergies] = useState<any>([]);
    const [diseases, setDiseases] = useState<any>([]);
    const [diets, setDiets] = useState<any>([]);
    const [visible1, setVisible1] = useState(false);
    const [email, setEmail] = useState("");
    const fadeOpacity = {
        initial: {
          opacity: 0,
        },
        animate: {
          opacity: 1,
          transition: {
            duration: 2.5,
          },
        }
      }
    useEffect(() => {
        const email = localStorage.getItem("email");
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if(email && isAuthenticated){
            setEmail(email);
        }
    }, []);

    const getCurrentSeason = () => {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1; // Month index starts from 0
      
        if (month >= 3 && month <= 5) {
          return 'Spring';
        } else if (month >= 6 && month <= 8) {
          return 'Summer';
        } else if (month >= 9 && month <= 11) {
          return 'Autumn';
        } else {
          return 'Winter';
        }
      };
      
    const getCurrentTimeOfDay = () => {
        const currentHour = new Date().getHours();
        
        if (currentHour >= 6 && currentHour < 12) {
            return 'Morning';
        } else if (currentHour >= 12 && currentHour < 18) {
            return 'Afternoon';
        } else {
            return 'Night';
        }
    };

    function shuffleArray(array: any) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    useEffect(() => {
        if (email) {
            axios.get(`http://localhost:4000/users/recommendations/${email}`)
                .then((response) => {
                    console.log("Response recommended Characteristics:", response.data);
                    const characteristics = response.data.map((item: any) => item.trim());
                    console.log("Characteristics:", characteristics);
                    setRecommendedCharacteristics(characteristics);
                    // Check if response contains the characteristics
                    if (response.data && Array.isArray(response.data)) {
                        const characteristics = response.data;
    
                        // Check for Diseases
                        const diseases = characteristics.filter(characteristic => characteristic.startsWith('Diseases'));
                        if (diseases) {
                            const diseasesOptions = diseases.map(disease => disease.split(': ')[1].toLowerCase().replace(/\s+/g, '+'));
                            setDiseases(diseasesOptions);
                        }
    
                        // Check for Allergies
                        const allergies = characteristics.filter(characteristic => characteristic.startsWith('Allergies'));
                        if (allergies) {
                            const allergiesOptions = allergies.map(allergy => allergy.split(': ')[1].toLowerCase().replace(/\s+/g, '+'));
                            setAllergies(allergiesOptions);
                        }
    
                        // Check for Diets
                        const diets = characteristics.filter(characteristic => characteristic.startsWith('Diets'));
                        if (diets) {
                            const dietsOptions = diets.map(diet => diet.split(': ')[1].toLowerCase().replace(/\s+/g, '+'));
                            setDiets(dietsOptions);
                        }
                    }
                })
                .catch((error) => {
                    console.log("Error:", error);
                })
        } else {
            setRecommendedCharacteristics([]);
        }
    }, [email]);
    
    const isMounted2 = useRef(false); // useRef to track if component has mounted
    useEffect(() => {
        if (recommendedCharacteristics.length > 0) {
            setRecipes([]);
            const params = [];
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
            console.log("Query Params: ", queryParams);
            if (queryParams.length === 0) {
                axios.get(`http://localhost:8010/proxy/recipes`)
                    .then(response => {
                        console.log("Recipes: ", response.data.recipes);
                        let recipesData = response.data.recipes;
            
                        // Shuffle recipes randomly
                        const shuffledRecipes = shuffleArray([...recipesData]); // Make a copy to avoid mutating the original array
                
                        setRecipes(shuffledRecipes);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } else {
                axios.get(`http://localhost:8010/proxy/recipes${queryParams}`)
                .then(response => {
                    console.log("Recipes2: ", response.data.recipes);
                    let recipesData = response.data.recipes;
            
                    // Shuffle recipes randomly
                    const shuffledRecipes = shuffleArray([...recipesData]); // Make a copy to avoid mutating the original array
            
                    console.log("Shuffled Recipes: ", shuffledRecipes);
            
                    setRecipes(shuffledRecipes);
                })
                    .catch(error => {
                        console.log(error);
                    });
            }
        } else if (!localStorage.getItem("email") && !isMounted2.current) {
            axios.get(`http://localhost:8010/proxy/recipes`)
                .then(response => {
                    let recipesData = response.data.recipes;
            
                    // Shuffle recipes randomly
                    const shuffledRecipes = shuffleArray([...recipesData]); // Make a copy to avoid mutating the original array
            
                    console.log("Shuffled Recipes unlogged: ", shuffledRecipes);
            
                    setRecipes(shuffledRecipes);
                })
                .catch(error => {
                    console.log(error);
                });
            isMounted2.current = true;
        }
    }, [recommendedCharacteristics, allergies, diseases, diets]);

    // Get articles
    const [articles, setArticles] = useState<any[]>([]);
    useEffect(() => {
        axios.get(`http://localhost:4000/objects/articles`) 
            .then((response) => {
                console.log("Response:", response.data);
                // setArticles(response.data);
                const filteredArticles = response.data.filter((article: any) => {
                    // Filter articles based on season and time of day relevance
                    const isRelevantSeason = article.season_relevance === 'All Year' || article.season_relevance === getCurrentSeason();
                    const isRelevantTimeOfDay = article.time_of_day_relevance === 'All Day' || article.time_of_day_relevance === getCurrentTimeOfDay();
                    return isRelevantSeason && isRelevantTimeOfDay;
                });

                // Check if the URL contains "/article" and params.id is defined
                const urlPathname = window.location.pathname;
                if (urlPathname.includes('/article')) {
                    const articleId = urlPathname.split('/').pop(); // Extract the article ID from the URL
                    const filteredArticlesWithoutCurrent = filteredArticles.filter((article: any) => article.ID !== articleId);
                    setArticles(filteredArticlesWithoutCurrent);
                } else {
                    setArticles(filteredArticles);
                }
            })
            .catch((error) => {
                console.log("Error:", error);
                setArticles([]);
            }) 
    }, []);
    // Get calculators
    const [calculators, setCalculators] = useState<any[]>([]);
    useEffect(() => {
        axios.get(`http://localhost:4000/objects/calculators`) 
            .then((response) => {
                console.log("Response:", response.data);
                // setCalculators(response.data);
                const filteredCalculators = response.data.filter((calculator: any) => {
                    // Filter calculators based on season and time of day relevance
                    const isRelevantSeason = calculator.season_relevance === 'All Year' || calculator.season_relevance === getCurrentSeason();
                    const isRelevantTimeOfDay = calculator.time_of_day_relevance === 'All Day' || calculator.time_of_day_relevance === getCurrentTimeOfDay();
                    return isRelevantSeason && isRelevantTimeOfDay;
                });
                // Check if the URL contains "/calculator" and params.id is defined
                const urlPathname = window.location.pathname;
                if (urlPathname.includes('/calculator')) {
                    const calculatorId = urlPathname.split('/').pop(); // Extract the calculator ID from the URL
                    const filteredCalculatorWithoutCurrent = filteredCalculators.filter((calculator: any) => calculator.ID !== calculatorId);
                    setCalculators(filteredCalculatorWithoutCurrent);
                    console.log("filtered Calculatours:", filteredCalculatorWithoutCurrent)
                } else {
                    setCalculators(filteredCalculators);
                }
            })
            .catch((error) => {
                console.log("Erro:", error);
                setCalculators([]);
            }) 
    }, []);

    // Responsive options for the carousel
    const responsiveOptions = [
        { breakpoint: '1400px', numVisible: 2, numScroll: 1 },
        { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
        { breakpoint: '767px', numVisible: 2, numScroll: 1 },
        { breakpoint: '575px', numVisible: 1, numScroll: 1 }
    ];

    // Template for rendering each article in the carousel
    const articleTemplate = (article: any) => {
        return (
            <div className="w-full justify-center items-center text-center grid grid-cols-1 gap-2  rounded-xl py-4 px-3 mx-2 " key={article.ID}>
                <div className="w-full flex items-center justify-center">
                    <a className="w-3/5 h-40 grid grid-cols-1 gap-1 " href={`/article/${article.ID}`}>
                        <div className="w-full flex justify-center items-center">
                            <Image className="w-full h-40 border-2 rounded-xl shadow-xl hover:scale-105"  src={article.image} alt={article.title} width={150} height={150} />
                        </div>
                    </a>
                </div>
                <div>
                    <h4 className="font-bold text-green2 text-xl mb-1">{article.title}</h4>
                    <h6 className="mt-0 mb-3 text-black text-opacity-50">{article.subtitle}</h6>
                </div>
            </div>
        );
    };

    // Template for rendering each article in the carousel
    const calculatorTemplate = (calculator: any) => {
        return (
            <div className="w-full justify-center items-center text-center grid grid-cols-1 gap-2  rounded-xl py-4 px-3 mx-2" key={calculator.ID}>
                <div className="w-full flex items-center justify-center">
                    <a className="w-3/5 h-40 grid grid-cols-1 gap-1 " href={`/calculator/${calculator.ID}`}>
                        <div className="w-full flex justify-center items-center">
                            <Image className="w-full h-40 border-2 rounded-xl shadow-xl hover:scale-105"  src={calculator.image} alt={calculator.title} width={150} height={150} />
                        </div>
                    </a>
                </div>
                <div className="w-full grid grid-cols-1 gap-1">
                    <div className="w-full flex justify-center items-center">
                        <h4 className="w-4/5 font-bold text-green2 text-xl mb-1">{calculator.title}</h4>
                    </div>
                    <div className="w-full flex justify-center items-center">
                        <h6 className="w-4/5 mt-0 mb-3 text-black text-opacity-50">{calculator.subtitle}</h6>
                    </div>
                </div>
            </div>
        );
    };

    // Template for rendering each article in the carousel
    const recipeTemplate = (recipe: any) => {
        return (
            <div className="w-full grid grid-cols-1 bg-gray-200 bg-opacity-30 p-4 border-2 rounded-xl hover:scale-105">
                <a href={`https://wishandcook.com/pt/recipes/${recipe.id}`} className="w-full h-40" target="_blank">
                    <Image
                    className='w-full  h-40 object-cover border-2 rounded-full shadow-xl'
                    src={recipe.image}
                    alt={'Meal Card Image'}
                    width={500}
                    height={500}
                    priority={true}
                    />  
                </a>
                {/* Thinking Balloon */}
                <div className="absolute top-6 -right-0 -mt-2 -mr-10  text-white rounded-full h-6 w-32 flex items-center justify-center text-xs">
                    {diseases.length > 0 || allergies.length > 0 || diets.length > 0 && (
                        <Button onClick={() => setVisible1(true)} label="Info" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 rounded-full ' text raised />
                    )}
                    <Dialog header="Important Information" headerClassName="bg-[url('../../public/images/stars.jpeg')] bg-cover" visible={visible1} style={{ width: '50vw' }} onHide={() => { setVisible1(false);  }}>
                        <div className="w-full flex items-center justify-center mt-8 bg-gray-200 p-4 border-2 rounded-xl shadow-xl">   
                        {diseases.length > 0 || allergies.length > 0 || diets.length > 0 ? (
                            <div className="w-full flex flex-col font-bold">
                                <h1 className=" text-start text-md font-bold underline text-xl">
                                    This is an awesome recipe for:
                                </h1>
                                {diets.length > 0 && (
                                    <div className="w-full my-4 capitalize">
                                        <i className="pi pi-caret-right"></i> For people who wants a {diets.map((diet:any) => diet.replace(/\+/g, ' ')).join(', ')} diet!
                                    </div>
                                )}
                                {diseases.length > 0 && (
                                    <div className="w-full my-4 capitalize">
                                        <i className="pi pi-caret-right"></i> {diseases.map((disease: any) => disease.replace(/\+/g, ' ')).join(', ')} people!
                                    </div>
                                )}
                                {allergies.length > 0 && (
                                    <div className="w-full my-4 capitalize">
                                        <i className="pi pi-caret-right"></i> People with allergy of {allergies.map((allergy: any) => allergy.replace(/\+/g, ' ')).join(', ')}
                                    </div>
                                )}
                            </div>
                        ) : null}
                        </div>
                    </Dialog>
                </div>
                <h3 className="w-full text-start text-xs text-green2 capitalize">{recipe.category}</h3>
                <h1 className="w-full text-start font-bold text-black text-opacity-60 h-20">{recipe.name}</h1>
                <div className="w-full grid grid-cols-2">
                    <h1 className="w-full text-start font-bold text-black text-opacity-60"> <i className="pi pi-star"></i> {recipe.average_rating}</h1>
                    <h1 className="w-full text-start font-bold text-black text-opacity-60"> <i className="pi pi-clock"></i> {recipe.duration}min</h1>
                </div>
            </div> 
        );
    };

    const [visible2, setVisible2] = useState(false);
    const [avgRating, setAvgRating] = useState(0);
    const [star1Percentage, setStar1Percentage] = useState(0);
    const [star2Percentage, setStar2Percentage] = useState(0);
    const [star3Percentage, setStar3Percentage] = useState(0);
    const [star4Percentage, setStar4Percentage] = useState(0);
    const [star5Percentage, setStar5Percentage] = useState(0);
    const userRatings = [];
    const [ratingValue, setRatingValue] = useState(0);
    const [giveRating, setGiveRating] = useState(false);
    const [ratingID, setRatingID] = useState('');
    const [editRating, setEditRating] = useState(0);
    const [ratingsCount, setRatingsCount] = useState(0);
    

    const { t } = useTranslation(params.lng || "", "signIn");
    const [article, setArticle] = useState<any>({});
    

    //Incrementing the views of the article
    const isMounted = useRef(false); // useRef to track if component has mounted
    useEffect(() => {
        if (!isMounted.current) {
            // Run only if component is mounted for the first time
            const fetchData = async () => {
                try {
                    axios.get(`http://localhost:4000/objects/article/${params.id}`)
                        .then(response => {
                            console.log("Article Response:", response.data);
                            setArticle(response.data);
                            // Extracting object characteristics associations
                            const objectCharacteristicsAssociations = response.data.objectCharacteristicsAssociations;

                            // Transforming object characteristics associations into the desired format
                            const transformedCharacteristics = objectCharacteristicsAssociations.map((association: any) => ({
                                characteristic: association.characteristics[0].name, // Assuming each association has only one characteristic
                                option_selected: association.option_selected
                            }));
                            axios.put(`http://localhost:4000/objects/views/article/${params.id}`)
                                .then(response => {
                                    console.log(response.data);
                                })
                                .catch(error => {
                                    console.log(error);
                                });
                            if(localStorage.getItem("email") && transformedCharacteristics.length > 0 && localStorage.getItem("isAdmin") !== "true"){
                                const email = localStorage.getItem("email");
                                axios.post(`http://localhost:4000/users/characteritics/${email}`, { characteristics: transformedCharacteristics })
                                .then(response => {
                                    console.log("Response user characteristics association", response.data);
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
            };

            fetchData();
            isMounted.current = true; // Update flag after initial render
        }
    }, [params.id]); // Only re-run effect if params.id changes

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
                    fontSize = '4rem';
                } else if (p2 === 'large') {
                    fontSize = '2rem';
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
        
    // Define a variable to hold the formatted description HTML
    let formattedDescriptionHTML = "";

    // Check if article.description is defined before calling formatDescriptionHTML
    if (article.description) {
        // Call formatDescriptionHTML and assign the result to the formattedDescriptionHTML variable
        formattedDescriptionHTML = formatDescriptionHTML(article.description);
    }

    useEffect(() => {
        axios.get(`http://localhost:4000/objects/ratings/article/${params.id}`)
        .then(response => {
            console.log("Response Get Ratings:", response.data);
            setStar1Percentage(Math.round(response.data.oneStarPercentage));
            setStar2Percentage(Math.round(response.data.twoStarPercentage));
            setStar3Percentage(Math.round(response.data.threeStarPercentage));
            setStar4Percentage(Math.round(response.data.fourStarPercentage));
            setStar5Percentage(Math.round(response.data.fiveStarPercentage));
            setAvgRating(parseFloat(response.data.averageRating));
            setRatingsCount(response.data.ratingsCount);
        })
        .catch(error => {
            console.log(error);
        });
    }, [params.id, visible2]);

    useEffect(() => {
        if(email){
            axios.get(`http://localhost:4000/objects/ratings/article/${params.id}/${email}`)
            .then(response => {
                console.log("Response Get User Ratings:", response.data);
                setGiveRating(true);
                setEditRating(response.data.ratings.rating);
            })
            .catch(error => {
                console.log(error);
            });
        }
    }, [params.id, email, visible2]);

    async function sendRating(){
        if(!email){
            setVisible2(false);
            alert("Please sign in to give a rating");
            return;
        }
        if(localStorage.getItem("isAdmin") === "true"){
            setVisible2(false);
            alert("Admins cannot give ratings");
            return;
        }
        axios.post(`http://localhost:4000/objects/ratings/article/${params.id}/${email}`, {rating: ratingValue} )
        .then(response => {
            console.log("Response Rating:", response.data);
            setGiveRating(true);
            setVisible2(false);
            setRatingValue(0);
        })
        .catch(error => {
            console.log(error);
        });
    }

    async function updateRating(){
        axios.put(`http://localhost:4000/objects/ratings/article/${params.id}/${email}`, {rating: editRating})
        .then(response => {
            console.log("Response Update Rating:", response.data);
            setVisible2(false);
        })
        .catch(error => {
            console.log(error);
        });
    }

    async function deleteRating(){
        axios.delete(`http://localhost:4000/objects/ratings/article/${params.id}/${email}`)
        .then(response => {
            console.log("Response Delete Rating:", response.data);
            setGiveRating(false);
            setVisible2(false);
            setEditRating(0);
        })
        .catch(error => {
            console.log(error);
        });
    }

    return (
        <>
            <div className="w-full grid grid-cols-1 gap-4 px-4 lg:px-32 lg:pl-32 lg:pr-0 pt-32">
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="w-full flex items-center justify-center text-center lg:text-left flex-col">
                        <div className="w-full mb-4">
                            <h1 className="w-full text-6xl text-balance text-green2">{article.title}</h1>
                        </div>
                        <div className="w-full text-lg text-black text-opacity-60">
                            <p>{article.subtitle}</p>
                        </div>
                    </div>
                    {article.image && (
                        <div className="w-full hover:scale-105">
                            <Image
                                className='w-full object-cover border-2 rounded-2xl lg:rounded-l-full mt-1 drop-shadow-2xl h-[300px] lg:h-[530px]'
                                src={article.image}
                                alt={'Article Image'}
                                width={500}
                                height={500}
                                priority={true}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full grid grid-cols-1 gap-4 px-4 lg:px-32 mt-24">
                <div className="w-full flex items-center justify-center text-left  p-6 border-2 rounded-xl shadow-xl mb-6 hover:scale-105">
                    <div className="w-full" dangerouslySetInnerHTML={{ __html: formattedDescriptionHTML }} />
                </div>
                <div className="w-full flex flex-col xl:flex-row justify-start">
                    <div className='w-full border-2 shadow-md lg:col-span-3 md:col-span-3 xs:col-span-3 p-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-center justify-center
                    rounded-xl my-4 lg:my-0'>
                        <div className='w-full grid grid-cols-1 gap-2 items-center justify-center'> 
                            <h1 className='text-5xl text-center'>{avgRating.toFixed(1)}</h1>
                            <div className='w-full items-center justify-center text-center'>
                                <Rating2 name="half-rating" value={avgRating} precision={0.5} readOnly />
                            </div>
                            <h3 className='text-center'>Average Rating</h3>
                            <div className='w-full text-black text-opacity-50'>
                                <h4 className='text-center'>Ratings Count: {ratingsCount}</h4>
                            </div>
                        </div>
                        <div className='w-full col-span-2 grid grid-cols-1 gap-2'>
                            <div className='w-full grid grid-cols-3 gap-2'>
                                <div className='w-full col-span-2'>
                                    <ProgressBar value={star5Percentage} />
                                </div>
                                <Rating2 name="half-rating" value={5} precision={0.5} readOnly />
                                <div className='w-full col-span-2'>
                                    <ProgressBar value={star4Percentage} />
                                </div>
                                <Rating2 name="half-rating" value={4} precision={0.5} readOnly />
                                <div className='w-full col-span-2'>
                                    <ProgressBar value={star3Percentage} />
                                </div>
                                <Rating2 name="half-rating" value={3} precision={0.5} readOnly />
                                <div className='w-full col-span-2'>
                                    <ProgressBar value={star2Percentage} />
                                </div>
                                <Rating2 name="half-rating" value={2} precision={0.5} readOnly />
                                <div className='w-full col-span-2'>
                                    <ProgressBar value={star1Percentage} />
                                </div>
                                <Rating2 name="half-rating" value={1} precision={0.5} readOnly />
                            </div>
                        </div>
                        <div className='w-full col-span-2'> 
                        </div>
                            {giveRating === false ? (
                                <div className='w-full text-right mt-2 '> 
                                    <Button label="Give a Rating" icon="pi pi-external-link" onClick={() => setVisible2(true)} className='p-2 bg-blue-500 text-white hover:bg-white hover:text-blue-500 -translate-x-5'/>
                                    <Dialog header="Give Rating" visible={visible2} style={{ width: '50vw' }} onHide={() => setVisible2(false)}>
                                        <div className='m-0 flex flex-col'>
                                            <div className='w-full text-center'>
                                                <Rating2
                                                name="simple-controlled"
                                                value={ratingValue !== null ? ratingValue : 0}
                                                onChange={(event, newValue) => {
                                                    setRatingValue(newValue !== null ? newValue : 0);
                                                }}
                                                />
                                            </div>
                                        <div className='w-full text-right'>
                                                <Button label="Submit" icon="pi pi-external-link" onClick={() => {sendRating()}}
                                                className='p-2 bg-blue-500 text-white hover:bg-white hover:text-blue-500 -translate-x-5'
                                                />
                                        </div>
                                        </div>

                                    </Dialog>
                                </div>
                            ) : (
                                <div className='w-full text-right mt-2 '> 
                                    <Button label="Edit Rating" icon="pi pi-external-link" onClick={() => {setVisible2(true)}} className='p-2 bg-blue-500 text-white hover:bg-white hover:text-blue-500 -translate-x-5'/>
                                    <Dialog header="Edit Rating" visible={visible2} style={{ width: '50vw' }} onHide={() => setVisible2(false)}>
                                        <div className='m-0 flex flex-col'>
                                            <div className='w-full text-center'>
                                                <Rating2
                                                name="simple-controlled"
                                                value={editRating !== null ? editRating : 0}
                                                onChange={(event, newValue) => {
                                                    setEditRating(newValue !== null ? newValue : 0);
                                                }}
                                                />
                                            </div>
                                        <div className='w-full text-right mt-2'>
                                                <Button label="Submit" icon="pi pi-external-link"   
                                                className='p-2 bg-blue-500 text-white hover:bg-white hover:text-blue-500 -translate-x-5'
                                                onClick={() => {updateRating()}}
                                                />
                                                <Button label="Delete Rating"   
                                                className=' ml-2 p-2 bg-red-500 text-white hover:bg-white hover:text-red-500 -translate-x-5'
                                                onClick={() => {deleteRating()}}
                                                />
                                        </div>
                                        </div>

                                    </Dialog>
                                </div>
                            )}
                    </div>
                    <div className="w-full flex items-center justify-center">
                        {recipes.length > 0 ? (
                            <div className="w-full flex flex-col justify-center items-center">
                                <h1 className="w-full mb-2 flex items-center justify-center text-center flex-row text-3xl font-bold text-green2 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">Our Recommended Recipes for You! <FaRegLaughWink size={'1.2em'} color={"green"} className='ml-2' /> </h1>
                                <div className="w-full">
                                    <Carousel
                                        value={recipes}
                                        numVisible={isMdScreen ? 3 : 1}
                                        numScroll={1}
                                        responsiveOptions={responsiveOptions}
                                        className="w-full"
                                        circular
                                        autoplayInterval={3000}
                                        itemTemplate={recipeTemplate}
                                    />
                                </div>
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                <div className="w-full grid grid-cols-1 gap-1 mt-8 ">
                    <div className="w-full flex justify-start items-center">
                        <h1 className="w-full text-4xl font-bold text-green2 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">Recommended for You !</h1>
                    </div>
                </div>
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-1  mt-4 border-2 rounded-xl">
                {articles.length > 0 ? (
                    <motion.div className="w-full grid grid-cols-1 gap-2 justify-start px-8 "
                    variants={fadeOpacity} initial="initial" whileInView="animate" viewport={{once:true,}}>
                        <div className="w-full flex justify-center items-center">
                            <div className="w-full md:w-2/3">
                                <Carousel
                                    value={articles}
                                    numVisible={1}
                                    numScroll={1}
                                    responsiveOptions={responsiveOptions}
                                    className="w-full"
                                    circular
                                    autoplayInterval={3000}
                                    itemTemplate={articleTemplate}
                                    orientation="vertical" verticalViewPortHeight="270px"
                                />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <></>
                )}
                {calculators.length > 0 ? (
                    <motion.div className="w-full grid grid-cols-1 gap-2 justify-start p-8 rounded-xl"
                    variants={fadeOpacity} initial="initial" whileInView="animate" viewport={{once:true,}}>
                        <div className="w-full flex justify-center items-center ">
                            <div className="w-full md:w-2/3">
                                <Carousel
                                    value={calculators}
                                    numVisible={1}
                                    numScroll={1}
                                    responsiveOptions={responsiveOptions}
                                    className="w-full"
                                    circular
                                    autoplayInterval={3000}
                                    itemTemplate={calculatorTemplate}
                                    orientation="vertical" verticalViewPortHeight="270px"
                                />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <></>
                )}
                </div>
            </div>
        </>
    );
}