"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import imageCompression from "browser-image-compression"
import { supabase } from "@/lib/supabase"
import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({ subsets:["latin"] })

export default function UploadPage(){

const params = useParams()
const eventCode = params.code as string
const [name,setName] = useState("")
const [files,setFiles] = useState<File[]>([])
const [previews,setPreviews] = useState<string[]>([])
const [uploading,setUploading] = useState(false)
const [progress,setProgress] = useState(0)
const [complete,setComplete] = useState(false)

/* PREVIEW IMAGES */

function handleFileSelect(e:React.ChangeEvent<HTMLInputElement>){

if(!e.target.files) return

const selected = Array.from(e.target.files)

if(selected.length > 30){
alert("Maximum 30 photos per upload")
return
}

setFiles(selected)

const urls = selected.map(file=>URL.createObjectURL(file))
setPreviews(urls)

}

/* REMOVE IMAGE */

function removeImage(index:number){

const updatedFiles = [...files]
const updatedPreviews = [...previews]

updatedFiles.splice(index,1)
updatedPreviews.splice(index,1)

setFiles(updatedFiles)
setPreviews(updatedPreviews)

}

/* HASH GENERATION */

async function generateHash(file:File){

const buffer = await file.arrayBuffer()

const hashBuffer = await crypto.subtle.digest("SHA-256",buffer)

return Array.from(new Uint8Array(hashBuffer))
.map(b=>b.toString(16).padStart(2,"0"))
.join("")

}

/* IMAGE COMPRESSION */

async function compressImage(file:File){

const options={
maxSizeMB:1.2,
maxWidthOrHeight:1920,
useWebWorker:true
}

return await imageCompression(file,options)

}

async function createThumbnail(file:File){

const options={
maxSizeMB:0.2,
maxWidthOrHeight:400,
useWebWorker:true
}

return await imageCompression(file,options)

}

/* UPLOAD WITH RETRY */

async function uploadWithRetry(path:string,file:File){

let { error } = await supabase.storage
.from("uploads")
.upload(path,file)

if(error){

await new Promise(r=>setTimeout(r,1500))

const retry = await supabase.storage
.from("uploads")
.upload(path,file)

return retry.error

}

return null

}

/* UPLOAD PHOTOS */

async function uploadPhotos(){

if(files.length===0) return

setUploading(true)

window.onbeforeunload = () => true

let uploaded = 0
const total = files.length

for(const file of files){

if(!file.type.startsWith("image/")){
alert("Only image files allowed")
continue
}

if(file.size > 20 * 1024 * 1024){
alert("File too large (max 20MB)")
continue
}

/* HASH */

const hash = await generateHash(file)

const { data:existing } = await supabase
.from("uploads")
.select("id")
.eq("image_hash",hash)
.maybeSingle()

if(existing){
const proceed = confirm("This photo may already exist. Upload anyway?")
if(!proceed) continue
}

/* COMPRESS */

const compressed = await compressImage(file)
const thumb = await createThumbnail(file)

/* PATHS */

const originalPath = `${eventCode}/originals/${crypto.randomUUID()}-${file.name.replace(/\s+/g,"_")}`
const thumbPath = `${eventCode}/thumbnails/${crypto.randomUUID()}-${file.name.replace(/\s+/g,"_")}`

/* STORAGE UPLOAD */

const originalError = await uploadWithRetry(originalPath,compressed)

if(originalError){
console.error(originalError)
continue
}

const thumbError = await uploadWithRetry(thumbPath,thumb)

if(thumbError){
console.error("Thumbnail upload failed",thumbError)
continue
}

/* DATABASE INSERT */

await supabase
.from("uploads")
.insert({
event_code:eventCode,
guest_name:name,
file_url:originalPath,
thumb_url:thumbPath,
image_hash:hash
})

uploaded++

setProgress(Math.round((uploaded/total)*100))

}

/* ANALYTICS */

await supabase.from("upload_events").insert({
event_code:eventCode,
device:navigator.userAgent.includes("Mobile")?"mobile":"desktop",
file_count:files.length
})

window.onbeforeunload = null

setUploading(false)
setFiles([])
previews.forEach(url => URL.revokeObjectURL(url))
setPreviews([])
setComplete(true)

}

/* RESET */

function resetUpload(){
setComplete(false)
setProgress(0)
}

return(

<div style={{
minHeight:"100vh",
background:"#f5f2ea",
padding:"40px 20px"
}}>

<div style={{
maxWidth:"700px",
margin:"0 auto",
background:"#ffffff",
padding:"30px",
borderRadius:"16px",
boxShadow:"0 8px 25px rgba(0,0,0,0.08)"
}}>

<h1
className={playfair.className}
style={{
textAlign:"center",
fontSize:"32px",
marginBottom:"10px",
color:"#333"
}}
>
Upload Wedding Photos
</h1>

<p style={{
textAlign:"center",
fontSize:"15px",
color:"#555",
marginBottom:"10px"
}}>
Share your favourite moments with the couple
</p>

<p style={{
textAlign:"center",
fontSize:"14px",
color:"#888",
marginBottom:"25px"
}}>
Powered by Zorava
</p>

{complete ? (

<div style={{textAlign:"center"}}>

<h2>✓ Photos uploaded successfully</h2>

<p>Thank you for sharing your memories</p>

<p style={{color:"#777",fontSize:"14px"}}>Powered by Zorava</p>

<div style={{
marginTop:"25px",
display:"flex",
flexWrap:"wrap",
gap:"12px",
justifyContent:"center"
}}>

<button
onClick={resetUpload}
style={{
background:"#e8aeb7",
color:"#fff",
border:"none",
padding:"12px 22px",
borderRadius:"30px",
marginRight:"10px"
}}
>
Upload More Photos
</button>

<a
href={`/gallery/${eventCode}`}
style={{
border:"2px solid #e8aeb7",
padding:"12px 22px",
borderRadius:"30px",
textDecoration:"none"
}}
>
View Wedding Album
</a>

</div>

</div>

):( 

<>

<input
placeholder="Your name (optional)"
value={name}
onChange={(e)=>setName(e.target.value)}
style={{
width:"100%",
padding:"14px",
marginBottom:"20px",
borderRadius:"10px",
border:"1px solid #ddd",
background:"#fff",
fontSize:"15px",
boxShadow:"0 1px 4px rgba(0,0,0,0.04)"
}}
/>

{/* FILE INPUTS */}

<input
id="photo-upload"
type="file"
multiple
accept="image/*"
onChange={handleFileSelect}
style={{display:"none"}}
/>

<input
id="camera-upload"
type="file"
accept="image/*"
capture="environment"
onChange={handleFileSelect}
style={{display:"none"}}
/>

{/* BUTTON ROW */}

<div style={{
display:"flex",
gap:"12px",
flexWrap:"wrap",
marginBottom:"20px"
}}>

<label
htmlFor="photo-upload"
style={{
padding:"14px 24px",
background:"#e8aeb7",
color:"#fff",
borderRadius:"30px",
cursor:"pointer"
}}
>
Select Images
</label>

<label
htmlFor="camera-upload"
style={{
padding:"14px 24px",
background:"#6d28d9",
color:"#fff",
borderRadius:"30px",
cursor:"pointer"
}}
>
Take Photo
</label>

</div>

{/* PREVIEW GRID */}

{previews.length>0 &&(

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",
gap:"10px",
marginTop:"20px"
}}>

{previews.map((src,i)=>(

<div key={i} style={{position:"relative"}}>

<img
src={src}
style={{
width:"100%",
aspectRatio:"1/1",
objectFit:"cover",
borderRadius:"8px"
}}
/>

<button
onClick={()=>removeImage(i)}
style={{
position:"absolute",
top:"5px",
right:"5px",
background:"#fff",
border:"none",
borderRadius:"50%",
cursor:"pointer"
}}
>
✕
</button>

</div>

))}

</div>

)}

<button
onClick={uploadPhotos}
disabled={uploading || files.length===0}
style={{
marginTop:"20px",
padding:"14px 24px",
background:"#e8aeb7",
border:"none",
borderRadius:"30px",
color:"#fff",
cursor: uploading ? "not-allowed" : "pointer",
opacity: uploading ? 0.6 : 1,
transition:"opacity 0.2s"
}}
>
{uploading?"Uploading...":"Upload Photos"}
</button>

{uploading &&(

<div style={{
marginTop:"25px",
display:"flex",
flexWrap:"wrap",
gap:"12px",
justifyContent:"center"
}}>

<p>Uploading your photos to the couple's wedding album...</p>

<div style={{
background:"#efe7df",
borderRadius:"20px",
height:"12px",
overflow:"hidden"
}}>

<div style={{
width:`${progress}%`,
background:"#e8aeb7",
height:"12px",
transition:"width .3s"
}}/>

</div>

<p style={{fontSize:"14px",color:"#666"}}>
Please keep this page open while Zorava uploads your photos.
</p>

</div>

)}

</>

)}

</div>
</div>
)

}
