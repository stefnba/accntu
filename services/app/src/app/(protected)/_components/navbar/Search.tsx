import { LuSearch } from 'react-icons/lu';

const Search = () => {
    return (
        <div className="relative ml-[240px] hidden md:block">
            <LuSearch className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
                // onChange={(e) => setValue(e.target.value)}
                // value={value}
                className=" h-10 rounded-md bg-gray-100 pl-9 text-slate-600 placeholder-slate-400 transition focus:w-[500px] focus:outline-gray-200  md:w-[300px]"
                placeholder="Search"
            />
        </div>
    );
};

export default Search;
