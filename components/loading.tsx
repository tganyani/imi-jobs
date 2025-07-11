import { LoaderCircle } from "lucide-react"


export default function Loading ({color}:{color:string}){
    return <div className="flex justify-center items-center w-full h-full">
        <LoaderCircle className={`h-6 w-6 animate-spin text-${color}`}/>
    </div>
}