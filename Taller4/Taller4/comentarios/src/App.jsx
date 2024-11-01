import { useState, useEffect } from 'react';
import { auth, db, registerUser, loginUser, logOut } from './firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './styles/Comentarios.css';

const PanelComentarios = () => {
  const [usuario, setUsuario] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [input, setInput] = useState({ correo: '', contraseña: '', nuevoComentario: '' });
  const [esRegistro, setEsRegistro] = useState(false);
  const [editar, setEditar] = useState({ id: null, texto: '' });
  const [ocultar, setOcultar] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUsuario);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const consulta = query(collection(db, 'comentarios'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(consulta, snapshot => {
      setComentarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const manejarAuth = async () => {
    if (esRegistro) await registerUser(input.correo, input.contraseña);
    else await loginUser(input.correo, input.contraseña);
    setInput({ ...input, correo: '', contraseña: '' });
  };

  const agregarComentario = async () => {
    if (input.nuevoComentario.trim()) {
      await addDoc(collection(db, 'comentarios'), {
        texto: input.nuevoComentario,
        idUsuario: usuario.uid,
        nombreUsuario: usuario.email,
        fecha: new Date()
      });
      setInput({ ...input, nuevoComentario: '' });
    }
  };

  const guardarEdicion = async () => {
    if (editar.texto.trim()) {//quitar los espac
      await updateDoc(doc(db, 'comentarios', editar.id), { texto: editar.texto });
      setEditar({ id: null, texto: '' });
    }
  };

  const toggleOcultar = (id) => {
    setOcultar(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      <h3>Agrega tus comentarios</h3>
      {usuario ? (
        <div>
          <textarea 
            value={input.nuevoComentario} 
            onChange={(e) => setInput({ ...input, nuevoComentario: e.target.value })} 
            placeholder="Escribe un comentario"
          />
          <button onClick={agregarComentario}>Publicar</button>
          <button onClick={logOut}>Cerrar sesión</button>
        </div>
      ) : (
        <div>
          <input 
            type="email" 
            value={input.correo} 
            onChange={(e) => setInput({ ...input, correo: e.target.value })}
            placeholder="Correo electrónico" 
          />
          <input 
            type="password" 
            value={input.contraseña} 
            onChange={(e) => setInput({ ...input, contraseña: e.target.value })}
            placeholder="Contraseña" 
          />
          <button onClick={manejarAuth}>{esRegistro ? 'Registrarse' : 'Iniciar sesión'}</button>
          <button onClick={() => setEsRegistro(!esRegistro)}>
            {esRegistro ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </div>
      )}

      <div>
        {comentarios.map(({ id, nombreUsuario, texto, idUsuario }) => (
          <div key={id}>
            <p><strong>{nombreUsuario}:</strong> 
              {!ocultar[id] ? (
                editar.id === id ? (
                  <textarea 
                    value={editar.texto} 
                    onChange={(e) => setEditar({ ...editar, texto: e.target.value })}
                  />
                ) : (
                  texto
                )
              ) : (
                <span>Comentario oculto</span>
              )}
            </p>
            {usuario && idUsuario === usuario.uid && (
              <div>
                {editar.id === id ? (
                  <>
                    <button onClick={guardarEdicion}>Guardar</button>
                    <button onClick={() => setEditar({ id: null, texto: '' })}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditar({ id, texto })}>Editar</button>
                    <button onClick={() => deleteDoc(doc(db, 'comentarios', id))}>Eliminar</button>
                    <button onClick={() => toggleOcultar(id)}>
                      {ocultar[id] ? 'Mostrar' : 'Ocultar'} Comentario
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelComentarios;