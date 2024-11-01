import { useState, useEffect } from 'react';
import { auth, db, registerUser, loginUser, logOut } from './firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './styles/Comentarios.css';
//variables
const PanelComentarios = () => {
  const [usuario, setUsuario] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [credenciales, setCredenciales] = useState({ correo: '', contraseña: '' });
  const [esRegistro, setEsRegistro] = useState(false);
  const [comentarioEditado, setComentarioEditado] = useState(null);
//funciones 
  useEffect(() => onAuthStateChanged(auth, setUsuario), []);
  useEffect(() => {
    const consulta = query(collection(db, 'comentarios'), orderBy('fecha', 'desc'));
    const cancelarSubscripcion = onSnapshot(consulta, snapshot => {
      setComentarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return cancelarSubscripcion;
  }, []);
  const manejarAutenticacion = async () => {
    const { correo, contraseña } = credenciales;
    if (correo && contraseña) {
      esRegistro ? await registerUser(correo, contraseña) : await loginUser(correo, contraseña);
      setCredenciales({ correo: '', contraseña: '' });
    } else {
      alert("Completa todos los campos");
    }
  };
  const agregarComentario = async () => {
    if (nuevoComentario.trim()) {
      await addDoc(collection(db, 'comentarios'), {
        texto: nuevoComentario,
        idUsuario: usuario.uid,
        nombreUsuario: usuario.email,
        fecha: new Date(),
      });
      setNuevoComentario('');
    } else {
      alert("Escribe algo antes de publicar!");
    }
  };
  const eliminarComentario = async (id) => {
    if (alert("¿Estás seguro de que quieres eliminar este comentario?")) {
      await deleteDoc(doc(db, 'comentarios', id));
    }
  };
  const guardarComentarioEditado = async () => {
    if (comentarioEditado?.texto.trim()) {
      await updateDoc(doc(db, 'comentarios', comentarioEditado.id), { texto: comentarioEditado.texto });
      setComentarioEditado(null);
    }
  };

//estructura ht

  return (
    <div>
      <h3>Registrate y comenta :)</h3>
      {usuario ? (
        <div>
          <textarea 
            value={nuevoComentario} 
            onChange={(e) => setNuevoComentario(e.target.value)} 
            placeholder="¿Qué estás pensando?"
          />
          <button onClick={agregarComentario}>¡Publicar!</button>
          <button onClick={logOut}>Cerrar sesión</button>
        </div>
      ) : (
        <div>
          <input 
            type="email" 
            value={credenciales.correo} 
            onChange={(e) => setCredenciales({ ...credenciales, correo: e.target.value })}
            placeholder="Correo electrónico" 
          />
          <input 
            type="password" 
            value={credenciales.contraseña} 
            onChange={(e) => setCredenciales({ ...credenciales, contraseña: e.target.value })}
            placeholder="Contraseña" 
          />
          <button onClick={manejarAutenticacion}>
            {esRegistro ? 'Registrarse' : 'Entrar'}
          </button>
          <button onClick={() => setEsRegistro(!esRegistro)}>
            {esRegistro ? 'Ya tienes cuenta?' : '¿Nuevo?'}
          </button>
        </div>
      )}
      <div>
        <h3>Comentarios: </h3>
        {comentarios.map(({ id, nombreUsuario, texto, idUsuario }) => (
          <div key={id}>
            <p><strong>{nombreUsuario}:</strong> 
              {comentarioEditado?.id === id ? (
                <textarea 
                  value={comentarioEditado.texto} 
                  onChange={(e) => setComentarioEditado({ ...comentarioEditado, texto: e.target.value })} 
                />
              ) : (
                texto
              )}
            </p>
            {usuario && idUsuario === usuario.uid && (
              <div>
                {comentarioEditado?.id === id ? (
                  <>
                    <button onClick={guardarComentarioEditado}>Guardar</button>
                    <button onClick={() => setComentarioEditado(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setComentarioEditado({ id, texto })}>Editar</button>
                    <button onClick={() => eliminarComentario(id)}>Eliminar</button>
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