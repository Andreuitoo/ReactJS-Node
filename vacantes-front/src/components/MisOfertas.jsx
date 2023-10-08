import md5 from 'md5'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Titulo from './common/Titulo'
import Swal from 'sweetalert2'
import axios from 'axios'
import ListaVacantes from './ListaVacantes'

const MisOfertas = ({ setUser, pagina, setPagina }) => {
  const [nombre, setNombre] = useState('')
  const [goLogin, setGoLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [title, setTitle] = useState('')
  const [city, setCity] = useState('')
  const [job_type, setJob_type] = useState('')
  const [experience, setExperience] = useState(0)
  const [from_date, setFrom_date] = useState('')
  const [until_date, setUntil_date] = useState('')
  const [company_id, setCompany_id] = useState('')
  const [job_id, setJob_id] = useState('')
  const job_type_list = ['Remoto', 'Presencial', 'Semi-Presencial']
  const [vacantes, setVacantes] = useState([])
  const [vacante, setVacante] = useState(undefined)
  const [eliminar, setEliminar] = useState(undefined)

  
  const loadData = async () => {
    try {
      const { email, username, id, company } = await JSON.parse(localStorage.getItem('user'))
      const sessionId = localStorage.getItem('idSession')
      setUser(JSON.parse(localStorage.getItem('user')))

      setNombre(company)
      setCompany_id(id)
      if (sessionId !== md5(id + email + username)) {
        localStorage.clear()
        setGoLogin(true)
      }else {
        getVacantesApi()
      }
    } catch (err) {
      setGoLogin(true)
      localStorage.clear()
    }
  }

  const validarSession = async () => {
    try {
      const { email, username, id, company } = await JSON.parse(localStorage.getItem('user'))
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

  const registro = async (e) => {
    e.preventDefault()
    validarSession()

    let obj = { title, city, experience, from_date, until_date, company_id, job_type }
    if ([title, city, experience, from_date, until_date, company_id, job_type].includes('')) {
      Swal.fire({
        position: 'top-right',
        icon: 'warning',
        title: 'Debe llenar todos los campos',
        showConfirmButton: false,
        timer: 1500
      })
      return
    } else if (!job_type_list.includes(job_type)) {
      Swal.fire({
        position: 'top-right',
        icon: 'warning',
        title: 'Debe seleccionar todos el tipo de trabajo',
        showConfirmButton: false,
        timer: 1500
      })
      return
    } else {
      setLoading(true)
      let data = undefined
      try {
        if (vacante !== undefined) {
          data = await axios.put(`job/${vacante.job_id}`, obj)
        }else{
          data = await axios.post(`job`, obj)
        }
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: `<strong>${data.data.message}</strong>`,
          showConfirmButton: false,
          timer: 3000
        })

        limpiarCampos()
        getVacantesApi()

      } catch (err) {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: err.message.includes('401') ? 'Datos incorrectos' : err.message,
          showConfirmButton: false,
          timer: 3000
        })
      }
      setLoading(false)
    }
  }

  const borrar = () => {
    Swal.fire({
      title: 'Confirmar?',
      text: "Realmente desea eliminar la vacante?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminarla!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { id } = await JSON.parse(localStorage.getItem('user'))
          let obj = await {company_id:id}
          const {data} = await axios.delete(`job/${eliminar}`, {data: obj})
          Swal.fire(
            'Eliminada!',
            data.message,
            'success'
          )
        }catch (e) {
          Swal.fire(
            'Opps!',
            e.message,
            'success'
          )
        }
      }else{
        setEliminar()
      }
    })
  }

  const getVacantesApi = async () => {
    try {
      const { id } = await JSON.parse(localStorage.getItem('user'))
      const { data } = await axios.get(`http://localhost:3001/job/all/${id}/${pagina}/5`)
      setVacantes(data)
    } catch (err) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: err.message,
        showConfirmButton: false,
        timer: 3000
      })
    }
  }

  const limpiarCampos = () => {
    setCity('')
    setTitle('')
    setExperience('')
    setFrom_date('')
    setUntil_date('')
    setJob_type('')
    setJob_id('')
    setVacante(undefined)
  }

  useEffect(() => {
    loadData()
  }, [vacantes])

  useEffect(() => {
    getVacantesApi()
  }, [pagina])

  useEffect(() => {
    if(vacante){
       setCity(vacante.city)
          setTitle(vacante.title)
          setExperience(vacante.experience)
          setFrom_date(vacante.from_date.slice(0,10))
          setUntil_date(vacante.until_date.slice(0,10))
          setJob_type(vacante.job_type)
          setJob_id(vacante.job_id)
    }
  }, [vacante])

  useEffect(() => {
    if(eliminar > 0){
      borrar()
    }
  }, [eliminar])

  if (goLogin) {
    return <Navigate to="/login" />
  }

  return (
    <>
      <form onSubmit={registro}>
        <div className="container">
          <div className="row">


            <div className="col-md-4">
              <Titulo titulo='Gestión de vacantes' />
              <div className="card border mb-3" >
                <div className="card-body">
                  <h5 className="card-title text-center">Ingrese los datos</h5>

                  <div className="mb-3">
                    <input type="text" className="form-control" onChange={(e) => setTitle(e.target.value)}
                      value={title}
                      placeholder='Nombre de la vancante ej:React Dev' />
                  </div>

                  <div className="mb-3">
                    <input type="text" className="form-control" placeholder='Ciudad/País'
                      onChange={(e) => setCity(e.target.value)} value={city} />
                  </div>

                  <div className="mb-3">
                    <input type="number" className="form-control" placeholder='Experiencia (años)' min='1'
                      onChange={(e) => setExperience(e.target.value)} value={experience} />
                  </div>

                  <div className="mb-3">
                    <select className="form-select"
                      onChange={(e) => setJob_type(e.target.value)} value={job_type}>
                      <option value=''>Tipo de trabajo</option>
                      {
                        job_type_list.map((item, index) => {
                          return <option key={index}>{item}</option>
                        })
                      }
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Publicar Desde:</label>
                    <input type="date" className="form-control" min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setFrom_date(e.target.value)} value={from_date} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Publicar Hasta:</label>
                    <input type="date" className="form-control" min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setUntil_date(e.target.value)} value={until_date} />
                  </div>

                  <div className="d-grid mb-3">
                    {
                      loading ?
                        <>
                          <div className="spinner-border text-success mx-auto" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </>
                        : (
                          <>
                          {
                            vacante?<button className="btn btn-warning mb-3" type="submit">Guardar cambios</button> :
                            <button className="btn btn-success mb-3" type="submit">Publicar vacante</button>
                          }
                            <button className="btn btn-info mb-3" onClick={limpiarCampos} type="button">Cancelar</button>
                          </>
                        )
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <Titulo titulo='Lista de vacantes' />
              <div className="card border mb-3" >
                <div className="card-body">
                  <ListaVacantes setEliminar={setEliminar} eliminar={eliminar} pagina={pagina} setPagina={setPagina} vacante={vacante} setVacante={setVacante} vacantes={vacantes} />
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