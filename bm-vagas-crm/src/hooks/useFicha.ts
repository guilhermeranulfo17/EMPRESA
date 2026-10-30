import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

/** A ficha da empresa abre pela URL (?empresa=id), assim o "voltar" do celular fecha a ficha. */
export function useFicha() {
  const [params, setParams] = useSearchParams()
  const empresaId = params.get('empresa')

  const abrir = useCallback(
    (id: string) => {
      setParams((p) => {
        const novo = new URLSearchParams(p)
        novo.set('empresa', id)
        return novo
      })
    },
    [setParams],
  )

  const fechar = useCallback(() => {
    setParams((p) => {
      const novo = new URLSearchParams(p)
      novo.delete('empresa')
      return novo
    })
  }, [setParams])

  return { empresaId, abrir, fechar }
}
