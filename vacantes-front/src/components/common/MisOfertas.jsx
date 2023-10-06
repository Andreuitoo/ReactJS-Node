import md5 from 'md5'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Titulo from './Titulo'

const MisOfertas = ({setUser}) => {
    const [nombre, setNombre] = useState('')
    const [goLogin, setGoLogin] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [title, setTitle] = useState('')
    const [city, setCity] = useState('')
    const [job_type, setJob_type] = useState('')
    const [experience, setExperiencia] = useState(1)
    const [from_date, setFrom_date] = useState('')
    const [until_date, setUntil_date] = useState('')
    const [company_id, setCompany_id] = useState('')
    const job_type_list = ['Remoto', 'Presencial', 'Semi-Presencial']

    const loadData = async () => {
        try {
            const {email, username, id, company} = await JSON.parse(localStorage.getItem('user'))
            const sessionId = localStorage.getItem('idSession')
            setUser(JSON.parse(localStorage.getItem('user'))) 

            setNombre(company)
            setCompany_id(id)
            if (sessionId !== md5(id + email + username)) {
                localStorage.clear()
                setGoLogin(true)
            }
        } catch (err) {
            setGoLogin(true)
            localStorage.clear()
        }
    }

    const registro = (e) => {
        e.preventDefault()
        const obj = {title, city, experience,}
    }

    useEffect(() => {
        loadData()
    }, [])

    if(goLogin) {
        return <Navigate to="/login" />
    }

  return (
    <>
    <form>
        <div className="container">
          <div className="row">


            <div className="col-md-4">
            <Titulo titulo='Gestión de vacantes' />
              <div className="card border mb-3" >
                <div className="card-body">
                  <h5 className="card-title text-center">Ingrese los datos</h5>

                  <div className="mb-3">
                    <input type="text" className="form-control"  placeholder='Nombre de la vancante ej:React Dev'/>
                  </div>

                  <div className="mb-3">
                    <input type="text" className="form-control" placeholder='Ciudad/País'/>
                  </div>
                    
                  <div className="mb-3">
                    <input type="number" className="form-control" placeholder='Experiencia (años)' min='1'/>
                  </div>

                  <div className="mb-3">
                    <select className="form-select">
                        <option selected>Tipo de trabajo</option>
                        {
                            job_type_list.map((item, index) => {
                                return <option key={index}>{item}</option>
                            })
                        }
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Publicar Desde:</label>
                    <input type="date" className="form-control" min={new Date().toISOString().slice(0, 10)} />
                  </div>

                  <div className="mb-3">
                  <label className="form-label">Publicar Hasta:</label>
                    <input type="date" className="form-control" min={new Date().toISOString().slice(0, 10)} />
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
                    <button className="btn btn-success me-md-2" type="submit">Publicar vacante</button>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="col-md-8">
                <Titulo titulo='Lista de vacantes' />
                <div className="card border mb-3" >
                    <div className="card-body">
                        <h5 className="card-title text-center">Ingrese los datos</h5>
                    </div>
                </div>
            </div>


          </div>
        </div>
      </form>
    </>
  )
}

export default MisOfertas