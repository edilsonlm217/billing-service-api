import { useState, useCallback } from 'react'

interface UseFetchOptions extends RequestInit {}

export function useFetch<T = any>() {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const execute = useCallback(
    async (url: string, options?: UseFetchOptions): Promise<T | null> => {
      setLoading(true)
      setError(null)
      setData(null)

      try {
        const res = await fetch(url, options)
        if (!res.ok) {
          // tenta pegar o erro json, se possível
          let errorMsg = `Erro: ${res.status} ${res.statusText}`
          try {
            const errJson = await res.json()
            if (errJson.error) errorMsg = errJson.error
          } catch {}
          setError(errorMsg)
          setLoading(false)
          return null
        }
        const json = await res.json()
        setData(json)
        setLoading(false)
        return json
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido')
        setLoading(false)
        return null
      }
    },
    []
  )

  return { data, error, loading, execute }
}
