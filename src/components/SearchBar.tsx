"use client"
import { useOnClickOutside } from '@/hooks/use-on-click-outside'
import { Dish, Prisma } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { CommandEmpty, CommandGroup } from 'cmdk'
import debounce from 'lodash.debounce'
import { User } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Command, CommandInput, CommandItem, CommandList } from './ui/Command'

interface SearchBarProps {
  
}

const SearchBar: FC<SearchBarProps> = ({}) => {

    const [input, setInput] = useState<string>('')

    
    const {
        data: queryResults, 
        refetch, 
        isFetched, 
        isFetching
    } = useQuery({
        queryFn: async () => {
            if (!input) return []
            const { data } = await axios.get(`/api/search?q=${input}`)
            return data as (Dish & {
                _cout: Prisma.DishCountOutputType
            })[]
        },
        queryKey: ['search-query'],
        enabled: false,
    
    })

    const request = debounce(async () => {
        refetch()
    }, 300)

    const debounceRequest = useCallback(() => {
        request()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const router = useRouter()
    const pathname = usePathname()
    const commandRef = useRef<HTMLDivElement>(null)

    useOnClickOutside(commandRef, () => {
        setInput('')
    })


    useEffect(() => {
        setInput('')
    }, [pathname])

  return (<Command ref={commandRef} className='relative rounded-lg border max-w-lg z-50 overflow-visible'>
    <CommandInput 
    value={input}
    onValueChange={(text) => {
        setInput(text)
        debounceRequest()
    }}
    className='outline-none border-none focus:border-none focus:outline-none ring-0'
    placeholder='Search communities...'>

    </CommandInput>

    {input.length > 0 ? (
        <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-b-md'>
            {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
            {(queryResults?.length ?? 0) > 0 ? (
                <CommandGroup heading='Communities'>
                    {queryResults?.map((dish) => (
                        <CommandItem onSelect={(e) => {
                            router.push(`/dish/${e}`)
                            router.refresh()
                        }}
                        key={dish.id}
                        value={dish.name}>
                            <User className='mr-2 h-4 w-4' />
                            <a href={`/dish/${dish.name}`}>
                                dish/{dish.name}    
                            </a> 
                        </CommandItem>
                    ))}
                </CommandGroup>
            ): null} 
        </CommandList>
    ) : null}
  </Command>)
}

export default SearchBar