"use client";
import { useTranslation } from "@wac/app/i18n/client";
import AnimatedText from "./components/animatedText/AnimatedText";
import Image from "next/image";
import { FaQuestion, FaRegLaughWink, FaHardHat} from "react-icons/fa";
import nutrition_homepage from "../../public/images/nutrition_homepage.png";
import {useRef, useEffect, useState } from "react";
import axios, { all } from "axios";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Carousel } from 'primereact/carousel';
import React from "react";
import Slider from "react-slick";
import 'primeicons/primeicons.css';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';





interface PropsType {
    params: { lng: string };
}

export default function Example({ params: { lng } }: PropsType) {
    const { t } = useTranslation(lng, "home");
    const [email, setEmail] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [recommendedCharacteristics, setRecommendedCharacteristics] = useState<any[]>([]);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [allergies, setAllergies] = useState<any>([]);
    const [diseases, setDiseases] = useState<any>([]);
    const [diets, setDiets] = useState<any>([]);
    const [visible1, setVisible1] = useState(false);
    const isMdScreen = useMediaQuery({ query: '(min-width: 768px)' });

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
        const email = localStorage.getItem("email");
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if(email && isAuthenticated){
            setEmail(email);
        }
    }, []);

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
    
    const isMounted = useRef(false); // useRef to track if component has mounted
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
                
                        console.log("Shuffled Recipes unlogged: ", shuffledRecipes);
                
                        // Get the first 3 recipes or less if there are fewer than 3
                        const limitedRecipes = shuffledRecipes.slice(0, 3);
                
                        console.log("Sorted Recipes unlogged: ", limitedRecipes);
                
                        setRecipes(limitedRecipes);
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
            
                    // Get the first 3 recipes or less if there are fewer than 3
                    const limitedRecipes = shuffledRecipes.slice(0, 3);
            
                    console.log("Sorted Recipes: ", limitedRecipes);
                    setRecipes(limitedRecipes);
                })
                    .catch(error => {
                        console.log(error);
                    });
            }
        } else if (!localStorage.getItem("email") && !isMounted.current) {
            axios.get(`http://localhost:8010/proxy/recipes`)
                .then(response => {
                    let recipesData = response.data.recipes;
            
                    // Shuffle recipes randomly
                    const shuffledRecipes = shuffleArray([...recipesData]); // Make a copy to avoid mutating the original array
            
                    console.log("Shuffled Recipes unlogged: ", shuffledRecipes);
            
                    // Get the first 3 recipes or less if there are fewer than 3
                    const limitedRecipes = shuffledRecipes.slice(0, 3);
            
                    console.log("Sorted Recipes unlogged: ", limitedRecipes);
            
                    setRecipes(limitedRecipes);
                })
                .catch(error => {
                    console.log(error);
                });
            isMounted.current = true;
        }
    }, [recommendedCharacteristics, allergies, diseases, diets]);

    // Get articles
    const [articles, setArticles] = useState<any[]>([]);
    useEffect(() => {
        let queryParams = "";
        if (recommendedCharacteristics && recommendedCharacteristics.length > 0) {
            if (queryParams !== "") {
                queryParams += "&";
            }
            const encodedCharacteristics = encodeURIComponent(JSON.stringify(recommendedCharacteristics));
            queryParams += `recommendedCharacteristics=${encodedCharacteristics}`;
        }
        const url = queryParams !== "" 
            ? `http://localhost:4000/objects/articles?${queryParams}`
            : `http://localhost:4000/objects/articles`;
            
        console.log("URL:", url);
        axios.get(url)
            .then((response) => {
                if (recommendedCharacteristics.length>0){
                    console.log("Response aqui:", response.data.articles);
                    // setArticles(response.data.articles);
                    const filteredArticles = response.data.articles.filter((article: any) => {
                        // Filter articles based on season and time of day relevance
                        const isRelevantSeason = article.season_relevance === 'All Year' || article.season_relevance === getCurrentSeason();
                        const isRelevantTimeOfDay = article.time_of_day_relevance === 'All Day' || article.time_of_day_relevance === getCurrentTimeOfDay();
                        return isRelevantSeason && isRelevantTimeOfDay;
                    });
                    // Shuffle the filtered articles array
                    const shuffledArticles = shuffleArray(filteredArticles);

                    console.log("Response objects by recommended characteristics:", shuffledArticles);
                    setArticles(shuffledArticles);
                } else {
                    console.log("Response:", response.data);
                    // setArticles(response.data);
                    const filteredArticles = response.data.filter((article: any) => {
                        // Filter articles based on season and time of day relevance
                        const isRelevantSeason = article.season_relevance === 'All Year' || article.season_relevance === getCurrentSeason();
                        const isRelevantTimeOfDay = article.time_of_day_relevance === 'All Day' || article.time_of_day_relevance === getCurrentTimeOfDay();
                        return isRelevantSeason && isRelevantTimeOfDay;
                    });
                    // Shuffle the filtered articles array
                    const shuffledArticles = shuffleArray(filteredArticles);

                    console.log("Response objects by recommended characteristics:", shuffledArticles);
                    setArticles(shuffledArticles);
                }
            })
            .catch((error) => {
                console.log("Error:", error);
                setArticles([]);
            });
    }, [recommendedCharacteristics]);
    // Get calculators
    const [calculators, setCalculators] = useState<any[]>([]);
    useEffect(() => {
        let queryParams = "";
        if (recommendedCharacteristics && recommendedCharacteristics.length > 0) {
            if (queryParams !== "") {
                queryParams += "&";
            }
            const encodedCharacteristics = encodeURIComponent(JSON.stringify(recommendedCharacteristics));
            queryParams += `recommendedCharacteristics=${encodedCharacteristics}`;
        }
    
        const url = queryParams !== "" 
            ? `http://localhost:4000/objects/calculators?${queryParams}`
            : `http://localhost:4000/objects/calculators`;
    
        console.log("url:", url)
        axios.get(url)
            .then((response) => {
                if (recommendedCharacteristics.length>0){
                    console.log("Response aqui:", response.data.calculators);
                    // setCalculators(response.data.calculators);
                    const filteredCalculators = response.data.calculators.filter((calculator: any) => {
                        // Filter calculators based on season and time of day relevance
                        const isRelevantSeason = calculator.season_relevance === 'All Year' || calculator.season_relevance === getCurrentSeason();
                        const isRelevantTimeOfDay = calculator.time_of_day_relevance === 'All Day' || calculator.time_of_day_relevance === getCurrentTimeOfDay();
                        return isRelevantSeason && isRelevantTimeOfDay;
                    });
                    // Shuffle the filtered articles array
                    const shuffledCalculators = shuffleArray(filteredCalculators);

                    console.log("Response objects by recommended characteristics:", shuffledCalculators);
                    setCalculators(shuffledCalculators);
                } else {
                    console.log("Response:", response.data);
                    // setCalculators(response.data);
                    const filteredCalculators = response.data.filter((calculator: any) => {
                        // Filter calculators based on season and time of day relevance
                        const isRelevantSeason = calculator.season_relevance === 'All Year' || calculator.season_relevance === getCurrentSeason();
                        const isRelevantTimeOfDay = calculator.time_of_day_relevance === 'All Day' || calculator.time_of_day_relevance === getCurrentTimeOfDay();
                        return isRelevantSeason && isRelevantTimeOfDay;
                    });
                    // Shuffle the filtered articles array
                    const shuffledCalculators = shuffleArray(filteredCalculators);

                    console.log("Response objects by recommended characteristics:", shuffledCalculators);
                    setCalculators(shuffledCalculators);
                }
            })
            .catch((error) => {
                console.log("Error:", error);
                setCalculators([]);
            });
    }, [recommendedCharacteristics]);

    // Get carousels
    const [carousels, setCarousels] = useState<any[]>([]);
    const [carousel, setCarousel] = useState<any[]>([]);
    useEffect(() => {
        let queryParams = "";
        if (recommendedCharacteristics && recommendedCharacteristics.length > 0) {
            if (queryParams !== "") {
                queryParams += "&";
            }
            const encodedCharacteristics = encodeURIComponent(JSON.stringify(recommendedCharacteristics));
            queryParams += `recommendedCharacteristics=${encodedCharacteristics}`;
        }
    
        const url = queryParams !== "" 
            ? `http://localhost:4000/objects/carousels?${queryParams}`
            : `http://localhost:4000/objects/carousels`;
    
        console.log("url:", url)
        axios.get(url)
            .then((response) => {
                if (recommendedCharacteristics.length>0){
                    console.log("Response aqui Carousels:", response.data.carousels);
                    // setCarousels(response.data.carousels);
                    if (response.data.carousels.length === 0) {
                        axios.get(`http://localhost:4000/objects/carousels`)
                            .then((response) => {
                                console.log("Response aqui Carousels2:", response.data);
                                // setCarousels(response.data.carousels);
                                const filteredCarousels = response.data.filter((carousel: any) => {
                                    // Filter carousels based on season and time of day relevance
                                    const isRelevantSeason = carousel.season_relevance === 'All Year' || carousel.season_relevance === getCurrentSeason();
                                    const isRelevantTimeOfDay = carousel.time_of_day_relevance === 'All Day' || carousel.time_of_day_relevance === getCurrentTimeOfDay();
                                    return isRelevantSeason && isRelevantTimeOfDay;
                                });
                                setCarousels(filteredCarousels);
                                // Check if there are any filtered carousels
                                // Check if there are any filtered carousels
                                if (filteredCarousels.length > 0) {
                                    // Generate a random index within the range of the filtered carousels array
                                    const randomIndex = Math.floor(Math.random() * filteredCarousels.length);
                                    
                                    // Select a random carousel using the random index
                                    const randomCarousel = filteredCarousels[randomIndex];
                                    
                                    // Save the random carousel as an array with one element
                                    const randomCarouselArray = [randomCarousel];
                                    // Set the random carousel array using setCarousel()
                                    setCarousel(randomCarouselArray);
                                }
                            })
                            .catch((error) => {
                                console.log("Error:", error);
                                setCarousels([]);
                            });
                    } else {
                        const filteredCarousels = response.data.carousels.filter((carousel: any) => {
                            // Filter carousels based on season and time of day relevance
                            const isRelevantSeason = carousel.season_relevance === 'All Year' || carousel.season_relevance === getCurrentSeason();
                            const isRelevantTimeOfDay = carousel.time_of_day_relevance === 'All Day' || carousel.time_of_day_relevance === getCurrentTimeOfDay();
                            return isRelevantSeason && isRelevantTimeOfDay;
                        });
                        console.log("Response carousels by recommended characteristics:", filteredCarousels);
                        setCarousels(filteredCarousels);
                        if (filteredCarousels.length > 0) {
                            // Generate a random index within the range of the filtered carousels array
                            const randomIndex = Math.floor(Math.random() * filteredCarousels.length);
                            
                            // Select a random carousel using the random index
                            const randomCarousel = filteredCarousels[randomIndex];
                            
                            // Save the random carousel as an array with one element
                            const randomCarouselArray = [randomCarousel];
                            // Set the random carousel array using setCarousel()
                            setCarousel(randomCarouselArray);
                        }
                    }
                } else {
                    console.log("Response:", response.data);
                    // setCarousels(response.data);
                    const filteredCarousels = response.data.filter((carousel: any) => {
                        // Filter carousels based on season and time of day relevance
                        const isRelevantSeason = carousel.season_relevance === 'All Year' || carousel.season_relevance === getCurrentSeason();
                        const isRelevantTimeOfDay = carousel.time_of_day_relevance === 'All Day' || carousel.time_of_day_relevance === getCurrentTimeOfDay();
                        return isRelevantSeason && isRelevantTimeOfDay;
                    });
                    setCarousels(filteredCarousels);
                    if (filteredCarousels.length > 0) {
                        // Generate a random index within the range of the filtered carousels array
                        const randomIndex = Math.floor(Math.random() * filteredCarousels.length);
                        
                        // Select a random carousel using the random index
                        const randomCarousel = filteredCarousels[randomIndex];
                        
                        // Save the random carousel as an array with one element
                        const randomCarouselArray = [randomCarousel];
                        // Set the random carousel array using setCarousel()
                        setCarousel(randomCarouselArray);
                    }
                }
            })
            .catch((error) => {
                console.log("Error:", error);
                setCarousels([]);
            });        
    }, [recommendedCharacteristics]);

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
                    <a className="w-4/5 h-40 " href={`/article/${article.ID}`}>
                        <Image className="w-full h-40 border-2 rounded-xl shadow-xl hover:scale-105"  src={article.image} alt={article.title} width={150} height={150} />
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
                    <a className="w-full h-40 grid grid-cols-1 gap-1 " href={`/calculator/${calculator.ID}`}>
                        <div className="w-full flex justify-center items-center">
                            <Image className="w-4/5 h-40 border-2 rounded-xl shadow-xl hover:scale-105"  src={calculator.image} alt={calculator.title} width={150} height={150} />
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

    const fadeInVariants = {
        initial: {
          opacity: 0,
          y: 100,
        },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 1.5,
          },
        }
      }  
    
      const fadeOutVariants = {
        initial: {
          opacity: 0,
          y: 0,
        },
        animate: {
          opacity: 1,
          y: 150,
          transition: {
            duration: 1.5,
          },
        }
      } 
    
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

    return (
        <>
            <AnimatedText
            text={t("title")}
            className="mb-16 mt-8 text-center text-green2 text-4xl lg:text-7xl sm:text-6xl xs:text-4xl sm:px-24 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
            />
            <div className="w-full grid grid-cols-1 gap-2 items-center justify-center">
                <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-1 mb-16'>
                    <motion.div className='w-full grid grid-cols-1 gap-2 px-10 py-16'
                    variants={fadeOpacity} initial="initial" whileInView="animate" viewport={{once:true,}}>
                        <div className='w-full flex flex-row items-center justify-center'>
                            <FaQuestion size={'5em'} color={"orange"} />
                            <p className='font-bold text-left text-xl lg:text-3xl sm:text-2xl ml-3 capitalize'>{t("question")}</p>
                        </div>
                        <div className='w-full flex flex-row items-center justify-center'>
                            <FaRegLaughWink size={'2em'} color={"orange"} className='ml-1' />
                            <p className='text-xl lg:text-3xl sm:text-2xl ml-3'>{t("description")}</p>
                        </div>    
                        <div className='w-full flex flex-row items-center justify-center'>
                            <FaHardHat size={'2em'} color={"orange"} className='ml-1' />
                            <p className='text-xl lg:text-3xl sm:text-2xl ml-3'>{t("description2")}</p>
                        </div>    
                    </motion.div>
                    <motion.div className="w-full grid grid-cols-1 gap-1"
                    variants={fadeOpacity} initial="initial" whileInView="animate" viewport={{once:true,}}>
                        <div className="w-full flex items-center justify-center">
                            <Image
                                className='w-3/5 object-cover mt-1 drop-shadow-2xl hover:scale-105'
                                src={nutrition_homepage}
                                alt={'Nutritional Service Image'}
                                width={500}
                                height={500}
                                priority={true}
                            />   
                        </div>
                    </motion.div>
                </div>
                {articles.length > 0 ? (
                    // <motion.div className="flex flex-col items-center" variants={fadeOpacity} initial="initial" whileInView="animate" viewport={{once:true,}}>
                    <motion.div className="w-full grid grid-cols-1 gap-2 justify-start shadow-xl bg-[url('../../public/images/tablebg.jpeg')] bg-contain p-8 "
                    variants={fadeOpacity} initial="initial" whileInView="animate" viewport={{once:true,}}>
                        <div className="w-full">
                            <a href="/articles" className="w-full">
                                <h1 className="w-full text-2xl md:text-3xl font-bold text-green2 hover:underline drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">Articles</h1>
                            </a>
                        </div>
                        <div className="w-full flex justify-center items-center">
                            {articles.length === 2 ? (
                                <div className="w-full xl:w-1/2">
                                    <Carousel
                                        value={articles}
                                        numVisible={isMdScreen ? 3 : 1}
                                        numScroll={2}
                                        responsiveOptions={responsiveOptions}
                                        className="w-full"
                                        circular
                                        autoplayInterval={5000}
                                        itemTemplate={articleTemplate}
                                    />
                                </div>
                            ) : articles.length === 1 ? (
                                <div className="w-full xl:w-1/3">
                                    <Carousel
                                        value={articles}
                                        numVisible={isMdScreen ? 3 : 1}
                                        numScroll={1}
                                        responsiveOptions={responsiveOptions}
                                        className="w-full"
                                        circular
                                        autoplayInterval={5000}
                                        itemTemplate={articleTemplate}
                                    />
                                </div>
                            ) : (
                                <div className="w-full xl:w-2/3">
                                    <Carousel
                                        value={articles}
                                        numVisible={isMdScreen ? 3 : 1}
                                        numScroll={1}
                                        responsiveOptions={responsiveOptions}
                                        className="custom-carousel"
                                        circular
                                        autoplayInterval={5000}
                                        itemTemplate={articleTemplate}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <></>
                )}
                {calculators.length > 0 ? (
                    <motion.div className="w-full grid grid-cols-1 gap-2 justify-start p-8 rounded-xl"
                    variants={fadeOpacity} initial="initial" whileInView="animate" viewport={{once:true,}}>
                        <div className="w-full">
                            <a href="/calculators" className="w-full">
                                <h1 className="w-full text-2xl md:text-3xl font-bold text-green2 hover:underline drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">Calculators</h1>
                            </a>
                        </div>
                        <div className="w-full flex justify-center items-center ">
                            {calculators.length === 2 && isMdScreen ? (
                                <div className="w-full xl:w-1/2">
                                    <Carousel
                                    value={calculators}
                                    numVisible={isMdScreen ? 3 : 1}
                                    numScroll={1}
                                    responsiveOptions={responsiveOptions}
                                    className="w-full"
                                    circular
                                    autoplayInterval={5000}
                                    itemTemplate={calculatorTemplate}
                                    />
                                </div>
                            ) : calculators.length === 1 ? (
                                <div className="w-full xl:w-1/3">
                                    <Carousel
                                    value={calculators}
                                    numVisible={isMdScreen ? 3 : 1}
                                    numScroll={1}
                                    responsiveOptions={responsiveOptions}
                                    className="w-full"
                                    circular
                                    autoplayInterval={5000}
                                    itemTemplate={calculatorTemplate}
                                    />
                                </div>
                            ) : (
                                <div className="w-full xl:w-2/3">
                                <Carousel
                                value={calculators}
                                numVisible={isMdScreen ? 3 : 1}
                                numScroll={1}
                                responsiveOptions={responsiveOptions}
                                className="w-full"
                                circular
                                autoplayInterval={5000}
                                itemTemplate={calculatorTemplate}
                                />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <></>
                )}
                {carousels.length > 0 && (
                <motion.div className="w-full grid grid-cols-1 gap-2 justify-start bg-[url('../../public/images/bg-gray-carousel.jpeg')] bg-cover p-8"
                variants={fadeOpacity} initial="initial" whileInView="animate" viewport={{once:true,}}>
                    <div className="w-full p-8 flex justify-center items-center font-mono ">
                        {carousel.map((carousel: any, index: any) => (
                            <div key={index} className="w-full grid grid-cols-1 gap-2">
                                <Slider {...settings}>
                                    {carousel.items.map((item: any, itemIndex: any) => (
                                        <React.Fragment key={itemIndex}>
                                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div className="w-full flex items-center justify-center p-4">
                                                    <a href={item.link} className="w-2/3 flex items-center justify-center">
                                                        <Image
                                                        className='w-full h-50  object-fill object-center border-2 rounded-t-full shadow-xl hover:scale-105'
                                                        src={item.image}
                                                        alt={`{${item.image} Image ${index + 1}}`}
                                                        width={500}
                                                        height={500}
                                                        priority
                                                        />  
                                                    </a>
                                                </div>
                                                <div className="w-full grid grid-cols-1 gap-2">
                                                    <div className="w-full flex flex-col items-center justify-center">
                                                        <div className="w-full flex flex-col justify-center items-center p-5">
                                                            <h1 className="w-full flex justify-center text-4xl font-bold text-green2">{item.title}</h1>
                                                            <h2 className="w-full flex justify-center text-black text-opacity-55">{item.subtitle}</h2>
                                                            <div className="w-full flex justify-center text-center mt-6" dangerouslySetInnerHTML={{ __html: item.description }} />
                                                        </div>
                                                        <a href={item.link} className="w-full flex mt-4 justify-center items-center">
                                                            <Button label={item.buttonText} className='w-1/2 border-2 rounded-2xl p-2 bg-gray-500 text-white hover:bg-white hover:text-gray-500' text raised/>
                                                        </a>
                                                    </div>
                                                </div>  
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </Slider>
                            </div>
                        ))}
                    
                    </div>
                </motion.div>
                )}
                {recipes.length > 0 ? (
                    <motion.div className="w-full grid grid-cols-1 gap-2 mt-24 " variants={fadeOpacity} initial="initial" whileInView="animate" viewport={{once:true,}}>
                        <div className="w-full px-8">
                            {/* <a href="/recipes" className="w-full "> */}
                                <h1 className="w-full text-3xl  sm:text-6xl xs:text-4xl  flex items-center justify-center text-center flex-row  font-bold text-green2 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">Our Recommended Recipes for You! <FaRegLaughWink size={'1.2em'} color={"green"} className='ml-2' /> </h1>
                            {/* </a> */}
                        </div>
                        <div className="w-full flex justify-center items-center font-mono bg-[url('../../public/images/bg-recipes3.jpeg')] bg-cover shadow-xl">
                                <div className="w-full flex items-center justify-center py-32">
                                    <div className="w-1/2 md:w-full lg:w-1/2  z-10 p-4 rounded-xl  grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {recipes.map((recipe: any, index: any) => (
                                            <div key={index} className=" relative w-full flex items-center justify-center bg-gray-300 bg-opacity-50 border-2 p-4 rounded-xl shadow-lg hover:scale-105">
                                                <div className="w-full grid grid-cols-1 gap-1">
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
                                                    <div className="absolute top-0 right-0 -mt-2 -mr-10  text-white rounded-full h-6 w-32 flex items-center justify-center text-xs">
                                                        {diseases.length > 0 || allergies.length > 0 || diets.length > 0 ? (
                                                            <Button onClick={() => setVisible1(true)} label="Important" className='p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 rounded-full ' text raised />
                                                        ) : null}
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
                                                    <h3 className=" mt-4 w-full text-start text-xs text-green2 capitalize">{recipe.category}</h3>
                                                    <h1 className="w-full text-start font-bold text-black text-opacity-60 h-20">{recipe.name}</h1>
                                                    <div className="w-full grid grid-cols-2">
                                                        <h1 className="w-full text-start font-bold text-black text-opacity-60"> <i className="pi pi-star"></i> {recipe.average_rating}</h1>
                                                        <h1 className="w-full text-start font-bold text-black text-opacity-60"> <i className="pi pi-clock"></i> {recipe.duration}min</h1>
                                                    </div>
                                                </div> 
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            
                        </div>
                    </motion.div>
                ) : (
                    <></>
                )}
            </div>  
        </>   
    );
}
