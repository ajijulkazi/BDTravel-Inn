//import Header from "../Header";

import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


export default function IndexPage(){
    const [places, setPlaces] = useState([]);
    useEffect(()=> {
        axios.get('/places', ).then(response => {
            setPlaces(response.data);
        });
    },[]);
    return (
        <div className="grid mt-8 gap-x-6 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {places.length > 0 && places.map(place =>(
                <Link to={'/place/'+place._id} key={place}>
                    <div className="bg-gray-500 mb-2 rounded-2xl " >
                        {place.photos[0] && (
                            <img className="rounded-2xl object-cover aspect-square" src={'http://127.0.0.2:4000/uploads/'+place.photos?.[0]} alt="" />
                        )}
                    </div>
                    <h3 className="font-bold">{place.address}</h3>
                    <h2 className="text-sm text-gray-500">{place.title}</h2>
                    
                    <div className="mt-1">
                        <span className="font-bold">${place.price} per night</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}