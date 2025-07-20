
export default function Footer(){
    return(
        <div className="min-h-30 flex flex-col justify-end items-center py-2"  style={{background: "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)"}}>
            <p className="text-sm text-white"> © {new Date().getFullYear()}  <span className="text-[var(--mygreen)]">imisebenzi</span>. All rights reserved.</p>
        </div>
    )
}
