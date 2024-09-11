"use client";
import { useTranslation } from "@wac/app/i18n/client";
import AnimatedText from "../components/animatedText/AnimatedText";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import Rating2 from '@mui/material/Rating';


interface PropsType {
    params: { lng: string };
}

export default function Articles({ params: { lng } }: PropsType) {
    const { t } = useTranslation(lng, "home");

    function shuffleArray(array: any[]) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    const [email, setEmail] = useState("");
    const [filter, setFilter] = useState<any>("");
    const filterOptions = [
        {
            id: 1,
            name: "Recommended",
            value: "Recommended",
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

    useEffect(() => {
        const email = localStorage.getItem("email");
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if(email && isAuthenticated){
            setEmail(email);
        } 
    }, []);

    const [recommendedCharacteristics, setRecommendedCharacteristics] = useState([]);
    useEffect(() => {
        if (filter === "Recommended" && email) {
            axios.get(`http://localhost:4000/users/recommendations/${email}`) 
                .then((response) => {
                    console.log("Response recommended Characteristics:", response.data);
                    const characteristics = response.data.map((item: any) => item.trim());
                    setRecommendedCharacteristics(characteristics);

                })
                .catch((error) => {
                    console.log("Erro:", error);
                })
        } else if (filter === "Recommended" && !email) {
            // Alert that needs to be logged in to see recommended characteristics
            alert("Please log in to see recommended characteristics.");
            setFilter("");
        }
          
    }, [filter]);

    // Get articles
    const [articles, setArticles] = useState<any[]>([]);
    useEffect(() => {
        let queryParams = "";
        if (orderBy) {
            queryParams += `order_by=${orderBy}`;
        }
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
    
        axios.get(url)
            .then((response) => {
                if (recommendedCharacteristics.length>0){
                    console.log("Response aqui:", response.data.articles);
                    const filteredArticles = response.data.articles.filter((article: any) => {
                        // Filter articles based on season and time of day relevance
                        const isRelevantSeason = article.season_relevance === 'All Year' || article.season_relevance === getCurrentSeason();
                        const isRelevantTimeOfDay = article.time_of_day_relevance === 'All Day' || article.time_of_day_relevance === getCurrentTimeOfDay();
                        return isRelevantSeason && isRelevantTimeOfDay;
                    });
                    // Shuffle the filtered articles array
                    console.log("Response filtered articles:", filteredArticles);
                    const shuffledArticles = shuffleArray(filteredArticles);

                    console.log("Response objects by recommended characteristics:", shuffledArticles);
                    setArticles(shuffledArticles);
                } else if (orderBy) {
                    console.log("Response orderby:", response.data);
                    // setArticles(response.data);
                    const filteredArticles = response.data.filter((article: any) => {
                        // Filter articles based on season and time of day relevance
                        const isRelevantSeason = article.season_relevance === 'All Year' || article.season_relevance === getCurrentSeason();
                        const isRelevantTimeOfDay = article.time_of_day_relevance === 'All Day' || article.time_of_day_relevance === getCurrentTimeOfDay();
                        return isRelevantSeason && isRelevantTimeOfDay;
                    });
                    setArticles(filteredArticles);
                }  else {
                    console.log("Response:", response.data);
                    // setArticles(response.data);
                    const filteredArticles = response.data.filter((article: any) => {
                        // Filter articles based on season and time of day relevance
                        const isRelevantSeason = article.season_relevance === 'All Year' || article.season_relevance === getCurrentSeason();
                        const isRelevantTimeOfDay = article.time_of_day_relevance === 'All Day' || article.time_of_day_relevance === getCurrentTimeOfDay();
                        return isRelevantSeason && isRelevantTimeOfDay;
                    });
                    setArticles(filteredArticles);
                }
            })
            .catch((error) => {
                console.log("Error:", error);
                setArticles([]);
            });
    }, [orderBy, recommendedCharacteristics]);

    return (
        <div  className="w-full grid grid-cols-1 gap-1">
            <AnimatedText
                text="Articles"
                className="mb-8 mt-8 text-center text-green2 text-4xl lg:text-7xl sm:text-6xl xs:text-4xl sm:px-24 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
            />
            <div className="w-full flex justify-start px-8">
                <div className="lg:w-2/5 w-full md:w-1/2 grid grid-cols-2 gap-2 ">
                    <Dropdown 
                        value={filter} 
                        onChange={(e) => setFilter(e.value)} 
                        options={filterOptions} 
                        optionLabel="name" 
                        placeholder="Filter By"
                        filter 
                        className="w-full h-12 border-2" 
                        panelClassName=' mt-1' 
                    />  
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
            </div>
            {articles.length > 0 ? (
                articles.map((article: any) => (
                    <div key={article.ID} className="w-full"  >
                        <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-2 p-8">
                            <div className="w-full lg:col-span-4 grid grid-cols-1 lg:grid-cols-3 gap-2">
                                <div className="w-full ">
                                    <a className="w-full h-52" href={`/article/${article.ID}`}>
                                        {article.image && (
                                            <Image
                                                className='w-full h-52 object-cover shadow-xl hover:scale-105'
                                                src={article.image}
                                                alt={'Article Image'}
                                                width={500}
                                                height={500}
                                                priority={true}
                                            />  
                                        )}
                                    </a> 
                                </div> 
                                <div className="w-full col-span-2 grid grid-cols-1 gap-1 lg:gap-2 p-2 lg:p-10">
                                    <p className="w-full text-center lg:text-left text-2xl font-bold">{article.title}</p>  
                                    <p className="w-full text-center lg:text-left text-lg">{article.subtitle}</p>   
                                    <a href={`/article/${article.ID}`}>
                                        <Button label="Read More" className='w-full lg:w-1/4 p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/>
                                    </a>  
                                </div>
                            </div>
                            <div className='w-full flex flex-col items-center justify-center text-center'>
                                <h1 className='text-5xl text-center'>{article.avg_rating.toFixed(1)}</h1>
                                <Rating2 name="half-rating" value={article.avg_rating} precision={0.5} readOnly />
                            </div>      
                        </div>
                        <hr key={`${article.id}-hr`}  /> {/* Add a unique key for the hr element */}
                    </div>
                ))
            ) : (
                <p>No articles found.</p>
            )}
        </div>
    );
}
