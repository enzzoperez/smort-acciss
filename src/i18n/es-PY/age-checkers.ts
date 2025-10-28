export default {
  minorRegistration: {
    title: '¿Sos mayor de edad?',
    options: {
      adult: {
        title: 'Sí, soy mayor de edad',
        subtitle: 'Tengo 18 años o más.',
      },
      minor: {
        title: 'No, soy menor de edad',
        subtitle: 'Tengo menos de 18 años.',
      },
    },
  },

  minorAgeAclaration: {
    title: 'Si sos menor, necesitas que un mayor te registre.',
    bullet1: 'Pedile a un adulto que se registre en la app.',
    bullet2:
      'El adulto debe ingresar a ‘Perfil’, tocar ‘Fast Pass para menores’ y seleccionar ‘Registro con selfie’.',
    bullet3: 'Sigan los pasos de la aplicación. Vas a necesitar tomarte la selfie para finalizar.',
    button: 'Ir al inicio',
  },

  minorFastPass: {
    title: 'Menores de edad',
    options: [
      {
        id: 'register',
        title: 'Activar Fast Pass para menores',
        subtitle: 'Necesitarás selfie y datos del menor',
      },
      {
        id: 'authorize',
        title: 'Autorizar al menor mediante código',
        subtitle: 'Usá el código que generó el menor',
      },
    ],
  },
};
