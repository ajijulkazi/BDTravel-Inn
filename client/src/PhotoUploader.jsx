import axios from "axios";
import { useState } from "react";

export default function PhotoUploader({addedPhotos, onChange}) {
    const [photoLink, setPhotoLink] = useState('');
    
    async function addPhotoByLink(ev) {
        ev.preventDefault();
        const {data:filename} = await axios.post('/upload-by-link', {link:photoLink})
        onChange(prev => {
            return [...prev, filename];
        });
        setPhotoLink('');
    }
    function uploadPhoto(ev) {
        const files = ev.target.files;
        const data = new FormData();
        for(let i=0; i< files.length; i++){
            data.append('photos', files[i]);
        }
        
        axios.post('/upload', data, {
            headers: {'Content-Type':'multipart/form-data'}
        }).then(response =>{
            const {data:filenames} = response;
            onChange(prev => {
                return [...prev, ...filenames];
            });
        })

    }
    return(
        <>
            <div className="flex gap-2">
                            <input type="text" value={photoLink} 
                                   onChange={ev => setPhotoLink(ev.target.value)} 
                                   placeholder={"Add using a link...jpg"} />

                            <button onClick={addPhotoByLink} className="bg-gray-200 px-4 rounded-2xl">Add&nbsp;photo</button>
                        </div>
                        
                        <div className=" mt-2 grid gap-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {addedPhotos.length >0 && addedPhotos.map(link =>(
                                <div className="h-32 flex" key={link}>
                                    <img className="rounded-2xl w-full object-cover" src={'http://127.0.0.2:4000/uploads/'+link} alt="" />
                                </div>
                            ))}
                        <label className=" h-32 cursor-pointer flex gap-1 items-center justify-center border bg-transparent rounded-2xl p-2 text-2xl text-gray-600">
                            <input type="file" multiple className="hidden" onChange={uploadPhoto} />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                            </svg>

                            Upload
                        </label>
                        </div>
        </>
    );
}