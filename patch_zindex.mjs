import fs from 'fs';
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

if (content.includes('<div className="hidden lg:block w-[280px] xl:w-[320px] shrink-0">')) {
    content = content.replace(
        '<main \n          className={`flex-1 min-w-0 ${borderClasses} min-h-screen bg-[#121216] max-w-[600px] w-full pb-20 lg:pb-0 ${effectClasses}`}',
        '<main \n          className={`flex-1 min-w-0 ${borderClasses} min-h-screen bg-[#121216] max-w-[600px] w-full pb-20 lg:pb-0 relative ${effectClasses}`}'
    );
    
    content = content.replace(
        'className="sticky top-0 z-50 bg-[#121216]/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2 flex items-center gap-6"',
        'className="sticky top-0 z-[60] bg-[#121216]/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2 flex items-center gap-6"'
    );
    
    fs.writeFileSync('src/pages/Profile.tsx', content);
    console.log('Fixed profile z-index');
}
