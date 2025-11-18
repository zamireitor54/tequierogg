/* 
  app.js
  - Aquí puedes editar los mensajes si quieres personalizarlos aún más.
  - Reemplaza la foto 'tu-foto.jpg' en la carpeta.
*/

document.addEventListener('DOMContentLoaded', () => {
  // --- Mensajes: edítalos libremente ---
  const birthdayMessages = [
    "Feliz cumpleaños, mi fresita.",
    "Gracias por existir y por cruzarte en mi camino.",
    "Que hoy te abrace la vida tan bonito como tú me abrazas el alma.",
    "Mereces un día lleno de luz, así como tú llenas los míos.",
    "Ojalá la vida te dé todo lo lindo que tú das sin darte cuenta.",
    "Hoy se celebra lo bonita que eres por dentro.",
    "Eres de esas personas que uno agradece haber conocido.",
    "Que este día te encuentre rodeada de cariño del bueno.",
    "Que cada deseo que pidas hoy encuentre el camino para volverse realidad.",
    "Eres como un rayito de calma en medio del caos.",
    "Que este cumpleaños te dé más motivos para sonreír que preocupaciones.",
    "Hoy estás de cumpleaños, mija, ¡y está prohibido no ser feliz!",
    "Vas pa’ grande, fresita, y la vida lo sabe.",
    "Que este día te rinda pa’ reír, pa’ gozar y pa’ agradecer.",
    "Que pa’ llorar no se pidió turno hoy, así que nada de tristezas.",
    "Que Dios te bendiga tanto que te sobren motivos pa’ ser feliz.",
  "Eres de esas personitas que uno dice \"¡ah carajo, qué suerte conocerla!\".",
    "Te deseo un día tan bonito como esa sonrisa que cargas siempre.",
    "Que la vida te premie porque lo que tú das es puro corazón.",
    "Hoy no te preocupes por nada, hoy solo recibe cariño.",
    "Que todo lo bueno venga y se quede, como los momentos que valen.",
    "Pa’ hoy: alegría, buena compañía y motivos pa’ sentirte orgullosa.",
    "Que este día te encuentre rodeada de cariño del que se siente de verdad.",
    "Tienes una forma tan bonita de iluminar todo… ojalá la vida te lo devuelva.",
    "Celebro la música que eres y la calma que transmites.",
    "Que este cumpleaños te abrace como una melodía suave.",
    "Que la vida te regale momentos que te llenen de paz.",
    "No sé qué viene para ti, pero sé que mereces cosas grandes y hermosas.",
    "Que este día te recuerde lo valiosa y especial que eres.",
    "Hoy brillas un poquito más, y yo agradezco poder ver eso en ti."
  ];

  const comfortMessages = [
    "Respira, fresita… no tienes que ser fuerte todo el tiempo; solo sé tú.",
    "A veces tu corazón se cansa, pero nunca deja de ser hermoso.",
    "Si hoy te pesa el mundo, amor mío, yo te ayudo a cargarlo.",
    "Si te caes diez veces, me avisas… que yo te ayudo a levantarte once. — Perros Criollos",
    "Que nadie te apague la sonrisa. — Perros Criollos",
    "La vida sabe más rico cuando uno no se rinde. — Perros Criollos",
    "Acuérdate de mí cuando sientas que el frío vuelve. — Morat",
    "No hay un final que no traiga un comienzo. — Morat",
    "Todo pasa… incluso lo que hoy parece eterno. — Morat",
    "Si te duele, es porque estás viva, y eso ya es ganancia. — Andrés Cepeda",
    "Hasta la noche más honda tiene estrellas. — Andrés Cepeda",
    "Lo que se rompe también aprende a brillar distinto. — Andrés Cepeda",
    "También esto pasará. — Sabiduría persa",
    "A veces el alma necesita silencio, no soluciones. — Rupi Kaur",
    "Eres suficiente. Siempre lo has sido. — Rupi Kaur",
    "No tengas miedo a sentir, niña bonita… ahí donde duele, también floreces. — Pablo Neruda",
    "Podrán cortar todas las flores, pero no podrán detener la primavera. — Pablo Neruda",
    "La herida es el lugar por donde entra la luz. — Rumi",
    "Tú eres el cielo; lo demás son solo nubes pasajeras. — Rumi",
    "El mundo rompe a todos, y después, muchos son fuertes en los lugares rotos. — Ernest Hemingway",
    "Incluso la luna tiene cicatrices… y mírala, sigue brillando.",
    "Pingui, no te exijas tanto; estás sanando cosas que nadie ve.",
    "Gato, tú eres más fuerte de lo que te das crédito.",
    "Aunque hoy todo se vea gris, tú sigues siendo color.",
    "Luna mía, no confundas cansancio con falta de capacidad.",
    "Fresita, los días duros no te definen; tú eres más que un mal momento.",
    "Cuando te sientas chiquita, recuerda lo gigante que es tu corazón.",
    "Amor mío, si hoy no puedes con todo, hazlo por partes. Yo te espero.",
    "Eres magia incluso cuando te sientes común.",
    "Gaticita mía, ninguna tormenta dura para siempre… pero tú sí.",
    "Tu sensibilidad es un superpoder, no una carga.",
    "Pingui, no eres difícil de querer; eres difícil de reemplazar.",
    "Fresita, tu ternura sana cosas que tú ni sabes.",
    "Cuando estés triste, léeme: yo creo en ti incluso cuando tú dudas.",
    "Hoy quizás dueles… pero también estás creciendo.",
    "No eres un caos; eres un universo organizándose.",
    "Mi niña, date permiso de descansar sin sentir culpa.",
    "Mi luna, incluso cuando te escondes sigues siendo luz.",
    "Amor mío, tú también mereces las palabras bonitas que das.",
    "Nada está perdido si tú sigues aquí.",
    "A veces el corazón se nubla… y no pasa nada, también llueve en los lugares más lindos.",
    "No estás sola; yo te acompaño hasta en tus silencios.",
    "Fresita, tú no te rompes: tú te reacomodas.",
    "Pingui, no eres un problema; eres una bendición con días difíciles.",
    "Si hoy te duele, mañana te hará más sabia.",
    "Gato, hasta el mar tiene días bravos… y sigue siendo mar.",
    "Mi luna, no te castigues por sentir de más; eso te hace única.",
    "Tu alma sabe volver a levantarse, incluso cuando tú no sabes cómo.",
    "Cuando el mundo sea mucho, ven aquí… yo te sostengo.",
    "Amor mío, no olvides esto: tú vales, tú importas, tú mereces todo."
  ];

  const loveNotes = [
    "Mi niña, me encanta como eres… tan tú, tan auténtica, tan preciosa sin intentarlo.",
    "Tu sonrisa, fresita, es de las cosas que más me arreglan el día.",
    "Tu voz tiene algo… no sé qué, pero me calma, me acompaña y me gusta demasiado.",
    "Me encanta cómo me tratas, con esa mezcla de ternura y fuerza que solo tú tienes.",
    "Pingui, tu forma de cuidarme sin hacer escándalo, sin anunciarlo, es de las cosas más bonitas que alguien ha hecho por mí.",
    "Tienes una manera de entenderme que a veces ni yo entiendo.",
    "Tu forma de ser con todos habla bien de tu corazón… eres noble sin presunción.",
    "Me gusta cómo eres fuerte sin dejar de ser sensible. Esa combinación es tuya y solo tuya.",
    "Admiro cómo siempre terminas logrando todo, incluso cuando te toca empezar desde cero.",
    "Tu capacidad de trabajar y salir adelante, aun cuando te ha tocado sola, me llena de orgullo.",
    "Mi niña bonita, tú no tienes que compararte con nadie para validar lo que sientes; tus problemas también importan.",
    "Aunque creas que “otros sufren más”, tu dolor también merece ser cuidado, escuchado y respetado.",
    "Te mereces que te abracen incluso cuando dices “estoy bien”.",
    "Eres de esas personas que brillan sin darse cuenta.",
    "Fresita, tu forma de adaptarte a todo, incluso a mí, es algo que valoro más de lo que crees.",
    "Me encanta a veces sin decir mucho, me haces sentir acompañado.",
    "Tu risa debería estar patentada… es demasiado linda.",
    "Tienes un corazón tan grande que a veces se te olvida que también necesita descansar.",
    "Pingui, me encanta cómo buscas soluciones en vez de rendirte.",
    "Eres de esas personas que uno admira en silencio… y yo te admiro un montón.",
    "Aprecio tu forma de cuidarme, incluso cuando tú estás cansadita.",
    "Niña, tú haces que todo se sienta menos pesado.",
    "Me gusta cómo te adaptas a la vida, aunque la vida no siempre te lo pone fácil.",
    "Gaticita, contigo entendí que ser dulce no te hace débil; tu ternura tiene una fuerza que admiro un montón.",
    "Me gusta que, sin proponértelo, haces que me den ganas de mejorar y de ser alguien que te sume, no que te reste.",
    "Tu forma de ver las cosas, con esa mezcla tan tuya de inocencia y carácter, es algo que de verdad me encanta.",
    "Amor mío, tu fortaleza no grita, pero se siente.",
    "Me encanta cómo estás, cómo acompañas, cómo te quedas.",
    "Tienes una calma que me contagia incluso en mis días más enredados.",
    "Eres tan bella por dentro que lo de afuera solo confirma lo que ya eres.",
    "Fresita, me encanta cómo te entregas a todo lo que haces, incluso cuando nadie lo nota.",
    "Tu forma de escuchar me hace sentir entendido sin explicarlo todo.",
    "Me encanta cómo, aunque te incomode que te digan cosas lindas, igual te las mereces todas.",
    "Pingui, tú eres hogar incluso sin intentarlo.",
    "Eres de esas personas que uno agradece conocer todos los días.",
    "Me encanta cómo brillas cuando hablas de lo que te gusta.",
    "Tu presencia me calma más que cualquier palabra.",
    "Gato lindo, tú eres suave incluso en tus momentos duros.",
    "Admiro cómo sigues, cómo avanzas, cómo no te rajas.",
    "Mi niña, tú eres una prueba viviente de que la belleza no necesita ruido.",
    "Me encanta cómo respetas, cómo quieres, cómo cuidas.",
    "Fresita, tu ternura es de esas que uno siente hasta en los huesos.",
    "La forma en que me miras cuando estoy mal… eso también es curita.",
    "Me hace feliz que seas tú la persona que me acompaña en este pedacito de vida.",
    "Pingui, tú tienes una luz que ni los días tristes te pueden apagar.",
    "Eres alguien que yo valoro más de lo que sé decir.",
    "Me encanta cómo, sin prometer nada, igual te quedas.",
    "Niña linda, tú eres de las cosas que más bonito se sienten sin tener que explicarlas.",
    "Tu esencia… esa forma tan tuya de ser… es de las cosas que más me gustan de ti.",
    "Y si algún día dudas, recuerda esto: yo agradezco que existas, así tal cual eres."
  ];

  const hundredReasons = [
    "Porque tu sonrisa me arregla cualquier día.",
    "Porque tienes una madurez que de verdad admiro.",
    "Porque eres fuerte, incluso cuando la vida te pesa.",
    "Porque tu forma de querer es sincera y bonita.",
    "Porque me cuidas porque te nace, no por obligación.",
    "Porque tu belleza se siente y se ve.",
    "Porque contigo todo se vuelve más suave.",
    "Porque escuchas hasta lo que no digo.",
    "Porque te fijas en detalles que otros ni notan.",
    "Porque tu risa es de mis sonidos favoritos.",
    "Porque aunque la vida te golpea, tú sigues firme.",
    "Porque cuando yo dudo de mí, tú igual me haces sentir que valgo demasiado.",
    "Porque tienes un el corazón más lindo.",
    "Porque tu mirada abraza.",
    "Porque cuando hablas de tus sueños te brillan los ojos.",
    "Porque eres leal y eso lo vale todito.",
    "Porque contigo puedo ser yo sin filtros.",
    "Porque cuando me apoyo en ti, de verdad estás.",
    "Porque tu ternura aparece justo cuando la necesito.",
    "Porque tu carácter refleja lo increíble que eres.",
    "Porque me haces querer ser mejor persona.",
    "Porque no me juzgas por mis heridas.",
    "Porque tienes más paciencia de la que tú misma crees.",
    "Porque tu presencia me calma.",
    "Porque a tu lado el tiempo pasa más bonito.",
    "Porque eres hermosa por dentro y por fuera.",
    "Porque confías en mí de una forma que valoro mucho.",
    "Porque me das paz sin esforzarte.",
    "Porque eres una luchadora de verdad.",
    "Porque no le huyes a lo importante.",
    "Porque tu madurez me sorprende cada día.",
    "Porque tu sencillez te hace todavía más preciosa.",
    "Porque ves cosas buenas en mí que yo no veo.",
    "Porque eres mi apoyo silencioso.",
    "Porque me haces sentir querido sin decir una palabra.",
    "Porque contigo puedo hablar de todo.",
    "Porque a veces ni hablo y aun así sabes qué me pasa.",
    "Porque me haces reír hasta en mis peores días.",
    "Porque tus abrazos curan.",
    "Porque contigo no existe la duda contigo todo es real.",
    "Porque no aparentas nada, siempre eres tú misma.",
    "Porque eres fuerte, pero también sabes mostrar tu lado frágil sin miedo.",
    "Porque te esfuerzas mucho por las personas que quieres.",
    "Porque me enseñaste lo que es querer bonito.",
    "Porque te importa lo que me pasa.",
    "Porque me haces sentir afortunado.",
    "Porque tus mensajes me mejoran el día.",
    "Porque valoras hasta lo pequeño.",
    "Porque eres dedicada con lo que amas.",
    "Porque en mis momentos duros nunca me sueltas.",
    "Porque tu sensibilidad es especial.",
    "Porque intentas entenderme, incluso cuando soy complicado.",
    "Porque tu sinceridad me da tranquilidad.",
    "Porque a tu lado se siente como casa.",
    "Porque tienes una esencia única.",
    "Porque contigo es fácil confiar.",
    "Porque te esfuerzas por tus metas.",
    "Porque me haces sentir visto.",
    "Porque tu cariño se nota en tus acciones.",
    "Porque eres inteligente y brillante.",
    "Porque tienes valores bonitos y reales.",
    "Porque a tu lado crezco como persona.",
    "Porque no te rindes fácil.",
    "Porque tu valentía es admirable.",
    "Porque eres un apoyo emocional increíble.",
    "Porque compartes tu mundo conmigo.",
    "Porque me haces sentir parte de tu vida.",
    "Porque contigo da gusto ilusionarse.",
    "Porque confías en mí incluso cuando yo no.",
    "Porque tu presencia me baja la ansiedad.",
    "Porque siempre encuentras cómo hacerme sonreír.",
    "Porque no escondes tus emociones.",
    "Porque eres dedicada y constante.",
    "Porque asumes tus errores con madurez.",
    "Porque eres una mujer que se hace respetar.",
    "Porque incluso molesta eres hermosa jejeje.",
    "Porque me enseñas sin darte cuenta.",
    "Porque tu corazón es enorme.",
    "Porque dices lo que sientes sin miedo.",
    "Porque me eliges, aunque sea un poquito, cada día.",
    "Porque respetas mis emociones.",
    "Porque a tu lado la vida pesa menos.",
    "Porque tu ternura me derrite.",
    "Porque eres trabajadora como pocas.",
    "Porque tienes sueños grandes y luchas por ellos.",
    "Porque me haces sentir capaz de todo.",
    "Porque te preocupas por mis cosas.",
    "Porque haces que los problemas no sean tan grandes.",
    "Porque tu voz me tranquiliza.",
    "Porque nunca me haces sentir menos.",
    "Porque contigo puedo imaginar un futuro sin miedo.",
    "Porque eres un ejemplo de fuerza emocional.",
    "Porque tu manera de amar es limpia y honesta.",
    "Porque me cuidas incluso en detalles mínimos.",
    "Porque eres de las personas más lindas que he conocido.",
    "Porque sin darte cuenta me enamoras un poquito más cada día.",
    "Porque me apoyas incluso en cosas que nadie entiende.",
    "Porque a tu lado me siento suficiente.",
    "Porque contigo incluso el silencio es bonito.",
    "Porque eres tú. Y eso ya es demasiado."
  ];

  // --- 365 Daily Messages (Nov 17, 2025 to Nov 17, 2026) ---
  const dailyMessages = [
    "Día 1: Hoy empieza esto que quiero darte cada día: un pedacito de cariño convertido en palabras. Y qué bonito que todo empiece contigo, fresita. A veces pienso que si el universo hablara, te describiría como un atardecer: suave, tranquilo, pero imposible de ignorar. Como dice Sabines: “me dueles, eso es todo, y sin embargo, qué dulce es este dolor.” y sabes algo pero qué bien se siente tenerte.",
    "Día 2: Gaticita, hoy solo quiero decirte que tu forma de ser es como una canción que uno no sabía que necesitaba hasta que suena. Como esa parte de Morat que dice “y aunque sé que no debo, cuando quiero te espero.” A mí me pasa eso contigo. Me nace esperarte, escucharte, leerte, pensarte.",
    "Día 3: A veces hablas de que otras personas han sufrido más y por eso crees que no deberías quejarte… pero amor, todos cargamos batallas distintas. Y la tuya, la que no dices, la que escondes con esa sonrisa tan suave, también merece abrazo. Merece descanso. Merece que alguien te diga: aquí estoy. Yo.",
    "Día 4: Pingüinita, tú eres como esas cosas chiquitas que cambian el día entero: un mensajito tuyo, un emoji tuyo, una risa tuya. Como escribió Neruda: “Quiero hacer contigo lo que la primavera hace con los cerezos.” No hablo de grandezas, hablo de florecer contigo poquito a poquito.",
    "Día 5: Hoy pensé en lo increíble que es cómo te adaptas, cómo avanzas aunque te toque sola, cómo te levantas aunque duelas. Y me dije: “qué mujer tan impresionante.” Andrés Cepeda canta “me gusta amarte sin razón” y aunque no somos nada todavía, me gusta quererte en esta forma tranquila, limpia, sin etiquetas apresuradas.",
    "Día 6: Lunita, tú eres esa calma que uno encuentra sin buscar. Esa paz tibiecita que aparece sin hacer ruido. Eres como esas madrugadas que no son perfectas, pero sí sinceras. Me encanta cómo ves el mundo, con inocencia, pero también con carácter. No sabes lo bonita que te ves cuando defiendes lo que sientes.",
    "Día 7: Hoy quiero dejarte una frase bonita: “Eras una pregunta, y yo me moría por enseñarte la respuesta.” Eso me pasa contigo: quiero descubrirte, preguntarte, escucharte. Tú haces que conocer a alguien vuelva a sentirse especial.",
    "Día 8: Fresita, tú tienes algo que no sé si sabes: tu voz, cuando hablas bajito, tiene el poder de desarmarme. Como dice Arjona: “no hay nada más bonito que mirar y no tocarte.” Y aun así, qué bonito es sentirte cerca desde el alma.",
    "Día 9: Hoy pienso en lo fuerte que eres sin presumirlo. En cómo te cuidas y cuidas a los demás con ese amor silencioso que solo tienen los corazones bonitos. Si algún día dudas de ti, recuerda esto: yo no. Yo no dudo jamás.",
    "Día 10: Gg, tú eres un poema caminando sin saberlo. “Tú eres la flor más callada del jardín,” habría dicho Benedetti si te conociera. Me encantas completica: tu forma de pensar, tus manías, tus risitas tontas, hasta tu forma de enojarte.",
    "Día 11: Niña linda, tú eres como abrir la ventana después de días nublados. Tienes algo que ilumina sin querer. Y no, no estoy exagerando. Solo estoy diciendo lo que pasa cuando pienso en ti.",
    "Día 12: Lunita, hoy pensé en tu sonrisa. Es de esas que uno no puede ver solo una vez: se queda. Se repite. Se guarda. Si mis palabras pudieran abrazarte, este mensaje sería un abrazo largo, de esos que dejan el alma más liviana.",
    "Día 13: Gatita, tú eres la prueba de que la ternura también puede ser valiente. Que suave no significa débil. Me inspiras a mejorar de formas que tú ni imaginas.",
    "Día 14: “Te pienso y me sonrío solo”, diría cualquier canción romántica. Pero es verdad, fresita. Tú tienes un efecto bonito en mí… como un recuerdo feliz antes de dormir.",
    "Día 15: Hoy quiero decirte esto: ojalá pudieras verte con mis ojos un segundo. Te darías cuenta de lo mucho que vales y de lo bien que haces incluso cuando crees que no.",
    "Día 16: Pingüinita hermosa, tú eres como un refugio que no sabía que necesitaba. Como esa parte de una canción que uno repite sin cansarse. A mí me pasa contigo.",
    "Día 17: Tu forma de cuidarme, de entenderme, de hablarme… eso es cariño del bueno. Del que no pesa, del que sana.",
    "Día 18: Hoy quiero regalarte esta frase de Jattin: “Te pienso, luego existo.” Eres pensamiento bonito, constante y suave.",
    "Día 19: Tu alma es tan noble que a veces me pregunto si sabes lo admirable que es. No cualquiera ama así, tan limpio, tan bonito.",
    "Día 20: “Qué privilegio coincidir contigo”, me digo a veces sin decirlo. Y sí, lo es. Lo siento. Lo agradezco.",
  "Día 21: Fresita, tú eres esa compañía que no pesa, la que descansa. Amo cómo se siente compartir días contigo, como si tu presencia ordenara todo lo que en mí estaba regado. Como dice Fito: “me siento menos solo cuando voy contigo.”",
  "Día 22: Gato lindo, me encanta la forma en la que tu ternura se mezcla con tu carácter. Eres dulce y fuerte a la vez, y esa mezcla tuya… uff, eso no se encuentra dos veces en la vida. 'Qué suerte la mía', pienso siempre.",
  "Día 23: Hay días en los que simplemente te miro (aunque sea mentalmente) y pienso: '¿cómo hace para ser tan bonita sin proponérselo?'. Tu forma de hablar, de cuidar, de estar… todo en ti es una caricia para el alma.",
  "Día 24: Niña, tú tienes un encanto calladito, de esos que enamoran sin ruido. 'Eras el abrazo que no sabía que necesitaba', escribiría yo si fuera poeta. Pero como no lo soy, solo te digo que contigo todo se siente tierno.",
  "Día 25: Tu risa debería ser patrimonio mundial, amor mío. Si supieras lo que provoca en mí: me afloja el pecho, me mejora el ánimo, me pinta el día. Es como una canción de Morat pero en versión tuya.",
  "Día 26: Mariposa mía, qué rico es compartir el día contigo. Esa calma tuya, esa forma de sentarte, de hablar, de sonreír… Tú eres hogar, aunque aún no lo digamos en voz alta.",
  "Día 27: Me encanta cómo avanzas en la vida: con miedo a veces, sí, pero avanzas. Qué admirable es eso. Eres fuerte sin presumirlo, y sensible sin esconderlo. Eso es magia pura.",
  "Día 28: Pingui, tú eres el poema que le faltaba a mis días. Como escribió Benedetti: 'No te prometo amor eterno, te prometo amor sincero.' Y cada vez que te hablo, te pienso desde la sinceridad más limpia.",
  "Día 29: Hoy quiero recordarte esto: tú mereces todo lo bonito del mundo. No porque seas perfecta, sino porque eres auténtica, buena, transparente. De esas almas que dejan huella sin intentarlo.",
  "Día 30: 'Eres mi lugar seguro', dirían muchas letras de canciones románticas. Pero contigo no es frase repetida: es verdad. A tu lado se siente suave, se siente natural, se siente correcto.",
  "Día 31: Fresita hermosa, hay algo en tu voz que me calma de una forma que nadie más logra. Es como si tu tono tuviera una llave a mi paz. Te escucho y todo se ordena.",
  "Día 32: Gg, tú eres la prueba de que la ternura también es poder. Que un corazón suave puede ser igual de fuerte que un corazón duro. Contigo, la vida pesa menos.",
  "Día 33: Lunita, tu forma de cuidarme me derrite. No es exagerada, no es ruidosa, es discreta y dulce. Es el tipo de amorcito que vale oro.",
  "Día 34: Hoy pensé en tus ojos. En cómo brillan cuando hablas de algo que te gusta o cuando te ríes por bobadas. Ese brillo tuyo me desarma cada vez.",
  "Día 35: Eres de esas personas que llegan sin prometer nada y aun así lo cambian todo. Como una parte linda del destino. Como un 'menos mal apareciste.'",
  "Día 36: Gatita, tu alma es tan noble que a veces siento que el mundo no te merece. Pero me alegra que yo sí pueda tenerte cerquita.",
  "Día 37: Te dejo esta frase hoy: 'Hay personas que son poemas sin necesidad de palabras.' Y tú, amor, eres exactamente eso.",
  "Día 38: Tu forma de adaptarte a la vida me inspira. Aún cuando digas que no es para tanto, para mí sí lo es. Tu valentía silenciosa es preciosa.",
  "Día 39: Niña linda, tú iluminas sin darte cuenta. No con cosas grandes, sino con gestos pequeños. Y esos valen más que cualquier exageración.",
  "Día 40: Qué bonito es compartir la vida contigo así, suavecito, sin prisas, pero con ganas. Muchísimas ganas.",
  "Día 41: Pingüinita, tú eres un susurro bonito en medio del ruido del mundo. Todo en ti tiene un toque dulce que me calma.",
  "Día 42: Amo cómo eres con la gente. Esa empatía tuya, esa delicadeza tuya al hablar, ese corazón enorme aunque lo escondas… eres un regalo.",
  "Día 43: Hoy quiero darte esta parte de Cepeda: 'Tus besos saben a libertad y a calma.' No necesito besarte para sentir eso. A veces basta con leerte.",
  "Día 44: Fresita, qué rica es tu presencia. Qué suave tu compañía. Qué afortunado me siento de que la vida nos llevara a coincidir.",
  "Día 45: Hoy pensé en tu fuerza. En cómo has cargado más de lo que la gente imagina. En cómo sigues adelante sin hacer escándalo. Eso te hace admirable.",
  "Día 46: Gatito mío, me encanta tu manera de hablar: pausada, tranquila, dulce, con ese tonito tuyo que parece un abrazo. Si pudiera grabarlo, lo escucharía siempre.",
  "Día 47: Hay días en los que miro lo que somos y pienso: 'Esto va pa’ algo bonito.' Y lo digo con la certeza más suave y sincera.",
  "Día 48: Lunita, tú eres un respiro. Un descanso. Un cariño que se siente sanito, limpio, genuino.",
  "Día 49: Tú eres la parte linda del día incluso cuando no estás. Porque te pienso, y pensarte me pone tierno.",
  "Día 50: Mariposa mía, gracias por existir así de bonito. Por ser dulzura y carácter. Por ser calma y chispa. Por ser tú, completica.",
  "Día 51: Fresita, hoy quiero agradecerte por algo: no cualquiera ve a través de una familia difícil, pero tú sí lo hiciste. Tú miraste más allá, miraste a mí. Y eso vale más que mil cosas bonitas. Como dice Sabines: “me viste cuando yo ni me veía.”",
  "Día 52: Niña linda, cada vez que me dices ‘pollo’ se me hace tierno el mundo. No sé qué tiene esa palabra en tu boca, pero suena a cariño, a risa, a hogar chiquito.",
  "Día 53: Hoy pensé en la forma en que miras mis ojos. Me dijiste que te gustaban, y desde entonces cada vez que te miro siento que me ves distinto… como si encontraras algo que yo no sabía que tenía.",
  "Día 54: Gato hermoso, tú tienes esa paciencia que se agradece. Esa forma de escuchar sin juzgar, de entender sin que te expliquen mucho. Tu alma abraza.",
  "Día 55: Te dejo esta frase de Neruda hoy: “En un beso, sabrás todo lo que he callado.” Quizás aún no te beso todo lo que quiero, pero si algún día lo hago, será con todo eso que me guardo cuando te miro.",
  "Día 56: Pingui, me encanta cómo caminas por la vida con ese equilibrio tuyo: ni dura ni frágil, solo humana. Eso es lindo de ver y más lindo de amar.",
  "Día 57: A veces siento que tus palabras llegan justo donde dolía, como si supieras dónde poner luz. No sé cómo lo haces, pero lo haces. Y eso es raro, y bonito, y tuyo.",
  "Día 58: Hoy te dejo esta de Andrés Cepeda: “Si te digo que no puedo imaginar mi vida sin ti, no exagero.” Aún no somos todo lo que seremos, pero contigo ya me imagino muchas cosas lindas.",
  "Día 59: Fresita mía, gracias por no soltarme incluso cuando viste el caos familiar detrás. Tu manera de quedarte dice más que mil te quieros.",
  "Día 60: Tus ojos y los míos tienen una forma rara de encontrarse, como si se reconocieran. Como si ya supieran que algo bonito se está armando.",
  "Día 61: Niña, me encanta cómo te ríes de cosas pequeñas. Esa risa tuya me ha salvado días que tú ni sabes.",
  "Día 62: Mariposa, tú eres como ese verso de Benedetti: “Tuve suerte contigo, lo supe desde el principio.”",
  "Día 63: Tu apoyo ha sido una de las cosas más bonitas que he recibido. Tú no te asustaste de mi historia, tú te quedaste. Y eso vale oro.",
  "Día 64: Pingüinita, cómo me gusta tu forma de consentirme sin exagerar. Ese cariño tuyo se siente real.",
  "Día 65: Hoy pensé en tus ojos brillando cuando hablas de tus sueños. Prometo celebrarte cada logro, y también acompañarte cuando duela.",
  "Día 66: 'Pollo'… qué palabra tan simple, pero en tu boca suena a ternura, a confianza, a cercanía. No sabes lo que provoca en mí.",
  "Día 67: Esta frase es para ti: ‘Hay miradas que tocan más que las manos.’ Y la tuya conmigo hace exactamente eso.",
  "Día 68: Niña, tú eres calma aunque estés cansada. Eres luz aunque estés triste. Eres fuerza aunque no te la reconozcas.",
  "Día 69: Hoy quiero repetir algo: Tú mereces amor bonito. Amor paciente. Amor suave. Y yo quiero ser parte de eso contigo.",
  "Día 70: Qué bonito es cuando me miras como si yo fuera algo bueno que te pasó. No sabes cómo me cambia el día.",
  "Día 71: Fresita, tú eres ese tipo de ternura que se queda, no que pasa. Lo tuyo marca, deja huella.",
  "Día 72: Dejo esto hoy: 'Lo mejor de mi día siempre tiene un poco de ti.' A veces en tu voz, a veces en tu risa, a veces en tu recuerdo.",
  "Día 73: Gata linda, tu forma de defender a quienes quieres me enamora. Tienes un corazón gigante, pero también carácter, y esa mezcla tuya… uff.",
  "Día 74: Hoy pensé en lo valiente que eres para lo tuyo, incluso cuando te toca sola. Tú siempre sales adelante. Y yo admiro eso cada día.",
  "Día 75: Pingui, qué suerte la mía de que tus ojos se hayan fijado en los míos. Desde ese día, mis ojos ya no miran igual.",
  "Día 76: Tu compañía cura. No lo digo por exagerar: tú haces que la vida sea más suave.",
  "Día 77: Frase para ti, de Morat: 'Yo no sé si tú me quieras, pero yo te quiero un poco más.' Y así me siento contigo.",
  "Día 78: Niña de mi vida, eres como un refugio en forma de persona. Tu alma abraza, incluso desde lejos.",
  "Día 79: Amo que no te rendiste conmigo. Que viste mis partes difíciles y aún así dijiste 'me quedo'. Eso no se olvida.",
  "Día 80: Hay algo en ti que no sé explicar, pero me hace querer quedarme. Y quedarme bien.",
  "Día 81: Hoy quiero recordarte que mereces descanso, mereces paz, mereces amor bonito. Y yo quiero darte eso poquito a poquito.",
  "Día 82: 'Pollo', así me dices… y yo derritido. Qué efecto tan raro tienes en mí.",
  "Día 83: Si mis ojos te gustan, ojalá supieras lo que tú provocas en ellos. Brillan diferente contigo.",
  "Día 84: Fresita, tu forma de abrazar (hasta mentalmente) me calma de una manera que nunca había vivido.",
  "Día 85: Hoy quiero dejarte esta de Julio Cortázar: 'Andábamos sin buscarnos, pero sabiendo que andábamos para encontrarnos.' Y mira… nos encontramos.",
  "Día 86: Gg, tu cariño tiene un olor bonito. No sé cómo explicarlo, pero tú hueles a hogar.",
  "Día 87: Tú eres la canción que no sabía que me gustaba hasta que la escuché bien. Desde entonces no la quiero parar.",
  "Día 88: Niña, tu fortaleza me inspira. Has cargado más de lo que dices, más de lo que muestras. Y aun así sigues siendo dulce. Eso es admirable.",
  "Día 89: Pingui, gracias por quedarte incluso cuando viste mis sombras. Lo tuyo es amor del bueno, aunque aún no lo nombremos así.",
  "Día 90: Si te miro es porque me haces sentir en casa. Si te pienso es porque ya eres parte de mí.",
  "Día 91: Hoy quiero dejarte esta frase: 'Hay personas que no saben ser medias tintas; o llegan para quedarse o no llegan.' Y tú llegaste para quedarte.",
  "Día 92: Fresita, tu ternura me enseña a ser más suave con el mundo. Y contigo quiero ser siempre mejor.",
  "Día 93: Tus ojos… qué cosa tan hermosa. Tienen un brillo que juro que me desarma.",
  "Día 94: Gata preciosa, cuando te pienso, se me acomoda el alma. No sé cómo lo logras, pero lo logras.",
  "Día 95: Hoy quiero darte esto de Sabina: 'No hay nada más bonito que lo que nunca he tenido.' Y contigo siento esa ilusión de lo que viene.",
  "Día 96: Niña mía, tú eres de esas almas que abrazan incluso cuando no están. Me acompañas hasta en silencio.",
  "Día 97: Pingui, gracias por ignorar mis complicaciones familiares y quedarte conmigo. No cualquiera lo hace, tú sí. Eso habla precioso de ti.",
  "Día 98: Tu forma de querer es suave, constante, calladita. Me gusta mucho, amor.",
  "Día 99: Si algún día dudas de ti, recuerda esto: Tú eres suficiente. Más que suficiente. Para mí, para el mundo, para tu historia.",
  "Día 100: Hoy pensé en ti como se piensa en algo frágil y fuerte al mismo tiempo. Como se piensa en la luna cuando está bajita y parece que uno pudiera tocarla con la punta de los dedos. Tú, que llegaste cuando no esperaba nada, terminaste siendo todo lo que necesitaba. Me sigues diciendo pollo, zamu, solecito, y yo siento que con esas palabras me curas partes que ni sabía que estaban rotas. Tus ojos… tus ojos son ese lugar donde mi mundo deja de temblar. Tu sonrisa, esa que se te forma cuando te hago reír sin querer, es de las cosas más bonitas que la vida me ha regalado. Y lo que más admiro es tu capacidad de quedarte, incluso sabiendo que mi familia es complicada, que mi vida es enredada, que yo soy un rompecabezas incompleto. Aun así te quedas… y te quedas bonito. 'Qué suerte la mía de encontrarte en este mundo tan lleno de ruido.'",
  "Día 101: Hoy amanecí con una imagen tuya en la cabeza: tú sonriendo, con esa expresión tuya que parece decir 'aquí estoy, pollo, no te me asustes'. A veces no sé cómo explicarte lo que provocas en mí. Es como si tu risa fuera canción, tus manos fueran refugio, y tu piel fuera esa calma que uno siempre quiere volver a tocar. Me encanta que me digas solecito. Porque tal vez no ilumino mucho, pero contigo sí me siento luz. 'Contigo aprendí que los días fríos también pueden calentar.'",
  "Día 102: Hoy quiero decirte algo sencillo: Me haces bien. Así, sin adornos. Me haces bien cuando me hablas suave. Me haces bien cuando me dices zamu como si fuera algo tuyo. Me haces bien cuando me miras con esos ojitos que parecen guardarlo todo. A veces pienso que si tú fueras un poema, serías uno de Benedetti: cálido, honesto, lleno de verdad escondida en palabras simples. Tú eres mi parte favorita del día. 'Eres eso que no sabía que buscaba hasta que lo encontré.'",
  "Día 103: Hoy quiero agradecerte algo importante: tu forma de comprenderme sin que yo tenga que explicarlo todo. A veces mi vida es un caos, a veces mi familia es difícil, a veces yo mismo soy difícil. Pero tú… tú solo me miras, respiras conmigo, y haces que todo parezca más fácil. Me encanta tu piel, tu manera de caminar, tu voz cuando estás emocionada. Me encanta que seas fuerte sin dejar de ser tierna. 'Tu risa es mi brújula cuando me pierdo.'",
  "Día 104: Hoy pensé en tu sonrisa. En cómo se te suben las mejillas, en cómo tus ojos brillan como si alguien hubiera encendido una lucecita adentro. Esa sonrisa tuya debería estudiarse, de verdad. Porque cura, calma, acompaña. Me gusta que me digas pollo. Me da risa, pero también me da ternura. Y me gusta que te guste mis ojos. Nadie los había mirado como tú lo haces. 'Hay miradas que te tocan más que las manos.'",
  "Día 105: Hoy te pienso suave, como cuando cae el sol en las tardes y todo se pone dorado. Así te siento: doradita, tibia, necesaria. Me gusta cómo me tratas, cómo me hablas, cómo cuidas incluso cuando dices que no sabes cuidar. Tienes un corazón tan bonito que a veces me da miedo no estar a la altura. Pero tú siempre me haces sentir suficiente. Siempre me haces sentir querido. 'Eres la parte del día que nunca quiero que se acabe.'",
  "Día 106: Hoy pensé en ti como se piensa en un hogar: no por las paredes, sino por la calma que uno siente al llegar. Tú eres esa calma. Esa que aparece cuando me dices solcito, cuando me preguntas si estoy bien, cuando te ríes de mis bobadas. Me encanta cómo eres conmigo, cómo te acercas sin miedo, cómo me abrazas con palabras. 'Tú eres mi lugar seguro aunque no lo sepas.'",
  "Día 107: Hoy quiero decirte algo que no siempre digo: Tu fortaleza me impresiona. Esa manera tuya de seguir, de levantarte, de trabajar, de cargar con cosas que la gente ni se imagina. Y sin embargo, sigues siendo dulce. Sigues siendo mi fresita bonita. 'Qué bonito es ver a alguien brillar incluso cuando el mundo intenta apagarle la luz.'",
  "Día 108: Hoy admiro tu manera de cuidar. Es suave, es sutil, es real. Tú cuidas preguntando, tú cuidas escuchando, tú cuidas quedándote. Y yo, que pocas veces confío, te dejé entrar sin darme cuenta. Y aquí estás, haciéndome sentir querido de una forma nueva. 'Hay abrazos que no se dan con los brazos sino con la presencia.'",
  "Día 109: Hoy quiero decirte que tu olor… tu olor es de las cosas más bonitas que he guardado en mi memoria. Es como un recuerdo suave, como un abrazo que no se olvida, como un 'aquí estoy' que se queda en la piel. Me encanta cómo hueles. Y me encanta cómo me haces sentir cuando estoy cerca de ti. 'Hay personas que huelen a hogar.'",
  "Día 110: Hoy pensé en lo bonito que es que me digas pollo. Suena chistoso, pero también suena a cariño. Y me gustó imaginarte diciéndomelo bajito, riéndote, mirándome con esos ojitos tuyos que hablan más que tus palabras. Eres tan bonita… en todo. 'Me gustas en todos tus tonos, en todas tus versiones, en todos tus silencios.'",
  "Día 111: Hoy quiero decirte que tu voz es una de mis cosas favoritas del mundo. La forma en la que me dices 'hola', cómo se te sube el tono cuando te emocionas, cómo suena cuando me dices solecito. Tu voz tiene algo que me calma. Algo que reconozco aunque esté lejos. 'Hay voces que uno quiere escuchar incluso cuando no dicen nada.'",
  "Día 112: Hoy pensé en tus manos. Y cómo, sin darte cuenta, me dan paz. Tus manos que trabajan, que luchan, que crean, que sostienen su propio mundo… Y aun así, tienen ternura para mí. 'Las manos dicen lo que las palabras no alcanzan.'",
  "Día 113: Hoy pensaba en algo simple: me gusta caminar contigo. No importa si es rápido, lento, de noche, de tarde… Caminar contigo se siente bien. Se siente como avanzar. Como que la vida tiene sentido. Como que no estoy solo. 'Hay personas que hacen del camino un lugar más bonito.'",
  "Día 114: Hoy quiero decirte que tu piel… tu piel tiene un brillo que solo tú sabes llevar. Es suave, cálida, bonita, y cuando la toco, siento que todo se ordena. Me encanta cómo eres. Me encanta cómo existes. 'Tu piel tiene la delicadeza de todo lo que uno quiere cuidar.'",
  "Día 115: Hoy agradezco la forma en la que me entiendes incluso cuando no explico nada. Como si ya supieras leerme. Como si tus ojos me reconocieran más rápido que mis propias palabras. Tú tienes algo que me desarma. Algo que me abraza sin tocarme. 'A veces, quien te entiende es quien te salva.'",
  "Día 116: Hoy pensé en lo bonito que es dormir sabiendo que existes. Que estás ahí. Que mañana podré hablarte. No sabes lo rico que es sentir esa paz. Esa tranquilidad que vino contigo. 'Eres ese pensamiento bonito que me acompaña sin pedir permiso.'",
  "Día 117: Hoy te pensé como se piensa en un refugio. No en un lugar, sino en la persona que te cuida sin preguntar. Y tú me cuidas así. A tu manera. Con tus silencios, con tus preguntas, con tu presencia. 'No todos los refugios tienen techo; algunos tienen tu nombre.'",
  "Día 118: Hoy quiero decirte algo sobre tus ojos: son peligrosamente hermosos. Porque me atrapan, me calman, me derriten, me hablan. Tus ojos dicen cosas que tu boca todavía no se atreve. Y yo las entiendo todas. 'Hay miradas que se vuelven hogar sin pedir permiso.'",
  "Día 119: Hoy pensé en tu risa. La risa que me gusta tanto que a veces busco excusas para verla. Esa risa tuya debería ser patrimonio del mundo. Porque cura. Porque alegra. Porque enamora. 'Si la felicidad tuviera sonido, sonaría como tu risa.'",
  "Día 120: Hoy quiero agradecerte por algo que tal vez no notas: tu capacidad de hacerme sentir suficiente. La vida me enseñó a dudar de mí. Pero tú… tú me miras como si fuera mucho más de lo que creo. 'Hay personas que te arreglan con un simple ‘quédate’.'",
  "Día 121: Hoy pensé en lo increíble que es la forma en que me hablas cuando estás tranquila. Tu tono se vuelve suavecito, como si cuidar fuera algo natural en ti. Y yo, que nunca he sido fácil, me dejo cuidar por ti sin miedo. Me encanta cómo eres, cómo te mueves, cómo existes. Me encanta que me digas zamu como si fuera tuyo. Me encanta que me veas con esos ojos que me derriten. ‘Qué bonito coincidir contigo en esta vida tan rara.’",
  "Día 122: Hoy agradezco tu madurez. Esa manera de enfrentar las cosas, de no rendirte, de trabajar incluso cuando estás cansada, de seguir adelante aunque estés por dentro hecha pedacitos. Tú eres fuerte… pero no de esas fuerzas que gritan. Eres fuerte de la forma más bonita: en silencio. ‘Hay personas que no presumen su fuerza, pero la sostienen todo.’",
  "Día 123: Hoy pensé en tus labios. En lo bonitos que son, en lo mucho que me gusta cuando se curvan para sonreír, en lo mucho que me derriten cuando dices mi nombre. A veces me pregunto si tú sabes el efecto que tienes en mí. Lo dudo. Pero lo tienes. Y es fuerte. ‘Tus labios tienen la forma exacta de mi calma.’",
  "Día 124: Hoy quiero decirte gracias por algo que nadie ve: por seguir conmigo, por no dejarte llevar por lo que escuchaste, por mirarme y decidir quedarte. Tú ignoraste mis miedos, mis historias, mis grietas, y aun así, elegiste conocerme más. ‘Quédate con quien te vea bonito incluso cuando estés roto.’",
  "Día 125: Hoy amanecí pensando en tus manos. Sí, tus manos. Las que siempre están frías pero se sienten cálidas cuando me tocan. Las que trabajan tanto. Las que merecen descanso, cariño y cuidado. Si te digo la verdad, me gustaría tomar tus manos y guardarlas en mi pecho, para que no les dé frío nunca. ‘Tus manos tienen la magia de poner mi alma en silencio.’",
  "Día 126: Hoy quiero escribirte algo simple pero real: Me haces querer ser mejor. Tu forma de ver el mundo, de buscar siempre un motivo para seguir, de apoyarme aunque yo no siempre lo merezca… Eso me mueve. Eso me inspira. ‘A veces el amor es simplemente admiración disfrazada de ternura.’",
  "Día 127: Hoy pensé en lo bonita que eres cuando estás concentrada. Se te frunce un poquito la boca, se te enfocan los ojos, te pierdes en lo que haces… Y yo podría quedarme mirándote horas, sin interrupciones, sin cansancio. ‘Hay bellezas que solo se ven cuando uno se toma el tiempo de observar.’",
  "Día 128: Hoy quiero decirte que me enamora tu forma de luchar por lo tuyo. Aunque estés cansada, aunque duela, aunque te sientas sola… Tú sigues. Tú avanzas. Tú no te rindes. Y eso, mi niña, es admirable. ‘Tu corazón es valiente, aunque tú no lo notes.’",
  "Día 129: Hoy pensé en cómo sería abrazarte largo, sin prisa, sin interrupciones, sin miedo. Creo que el mundo se callaría. Creo que tu corazón y el mío encontrarían el mismo ritmo. Creo que tú cabes perfectamente en mis brazos. ‘Hay abrazos que reparan cosas que uno ni sabía que estaban rotas.’",
  "Día 130: Hoy quiero decirte que me encanta escucharte hablar. De lo que sea. De lo más serio hasta lo más tonto. Tú hablas y yo me calmo. Tu voz es mi canción favorita últimamente. ‘Hay voces que no se olvidan, aunque uno quiera dormir.’",
  "Día 131: Hoy pensé en tu piel. Y en lo perfecta que es. No por cómo se ve… sino por cómo se siente. Tu piel tiene algo. Algo que no sé explicar, pero que conozco perfectamente. ‘Tu piel es el lugar donde mis manos quieren aprender a quedarse.’", 
  "Día 132: Hoy agradecí que estuvieras en mi vida. Así, sin motivo especial. Solo… agradecí. Porque tú eres de esas personas que llegan y cambian cosas sin romper nada. Que suman sin exigir. Que curan sin darse cuenta. ‘Qué lindo es encontrar personas que te cosen el alma sin aguja ni hilo.’",
  "Día 133: Hoy pensé en tus ojos otra vez. Sé que lo digo mucho… pero es que en serio, tus ojos parecen hechos para que yo me quede ahí. Tienen luz, tienen calma, tienen un brillo tan tuyo que no se puede copiar. ‘Tus ojos tienen secretos que solo quiero aprender a entender.’",
  "Día 134: Hoy quiero confesarte algo bonito: Tú haces que mi mundo sea menos duro. A veces todo pesa, a veces todo cansa, a veces mi vida parece un enredo eterno… Pero tú llegas, me dices pollo, y de repente respiro. ‘Hay personas que alivian con solo existir.’",
  "Día 135: Hoy pensé en tu sonrisa. Sí, otra vez. Porque tu sonrisa es de esas cosas que vale la pena repetir. Tu sonrisa es refugio, es luz, es medicina. ‘Tu sonrisa es el tipo de milagro que uno agradece sin entender.’",
  "Día 136: Hoy quiero decirte que tu fortaleza me enamora. No hablo de tu fuerza para aguantar, sino de tu fuerza para sentir, para seguir siendo buena incluso en los días malos. Tú eres de las almas bonitas. De las que no se encuentran fácil. ‘Ojalá te vieras como yo te veo: extraordinaria.’",
  "Día 137: Hoy te imaginé riéndote de mis bobadas. Y pensé: ‘bendito el día en que ella apareció.’ No sabes lo bonito que es escucharte reír. No sabes lo bonito que es hacerte feliz aunque sea un segundo. ‘Tu risa es mi parte favorita de ti.’",
  "Día 138: Hoy quiero agradecerte por confiar en mí. Por abrirte poquito a poco, por mostrarme partes tuyas que no le muestras a cualquiera. Eso vale oro. Eso es amor sin decirlo. ‘La confianza es el abrazo más sincero.’",
  "Día 139: Hoy pensé en tus piernas, en tu forma de caminar. Hay algo tan bonito en tu movimiento… como si tu cuerpo llevara ritmo propio. Te juro que podría reconocerte entre mil personas con solo verte caminar. ‘Hay cuerpos que no bailan, pero se mueven como poesía.’",
  "Día 140: Hoy quiero decirte algo suave: Me gustas. Pero no de esa forma apresurada. No. Me gustas lento, constante, de esa forma que construye. Que se queda. Que se siente en el pecho. ‘Hay personas que te gustan como si fueran destino.’",
  "Día 141: Hoy pensé en lo tierna que eres. Incluso cuando dices que no, incluso cuando te haces la fuerte, incluso cuando peleas conmigo jugando… Tu ternura es natural. Sale sin pedir permiso. ‘Eres la ternura que no sabía que me hacía falta.’",
  "Día 142: Hoy quiero decirte que me encanta cuando dices mi nombre. Tiene un ritmo diferente, tiene una intención dulce, tiene algo que me toca. Tú no dices mi nombre… tú lo acaricias. ‘Hay nombres que solo suenan bonitos en la boca correcta.’",
  "Día 143: Hoy pensé en lo mucho que admiro tu disciplina. Tu forma de trabajar, de estudiar, de cumplir, de perseguir lo que quieres. Eso es atractivo. Eso es valioso. Eso es hermoso. ‘La dedicación también es una forma de belleza.’",
  "Día 144: Hoy quiero decirte que tu olor a veces se me queda pegado en la memoria. A veces estoy lejos y me llega un recuerdo suavecito, como si estuvieras aquí. Tu olor es hogar. Tu olor es caricia. Tu olor es tú. ‘Los aromas más bonitos son los que abrazan sin tocar.’",
  "Día 145: Hoy agradecí lo paciente que eres conmigo. Porque no todos aguantan mis silencios, mis enredos, mis días difíciles… Pero tú sí. Y eso no lo olvidaré nunca. ‘La paciencia también es amor.’",
  "Día 146: Hoy pensé en la primera vez que sentí algo bonito por ti. Fue chiquito, fue suave, pero fue real. Y desde ahí… todo ha ido creciendo. Lento, bonito, certero. ‘Lo que nace suave suele quedarse.’",
  "Día 147: Hoy quiero decirte que tu forma de mirar me derrite. Tienes una mirada dulce, tierna, profunda… Una mirada que enamora sin querer. ‘Tus ojos dicen cosas que tus labios todavía guardan.’",
  "Día 148: Hoy pensé en lo bien que se siente hablar contigo. No importa el tema, no importa la hora. Tú hablas, y yo siento paz. ‘Hay conversaciones que son mejores que cualquier terapia.’",
  "Día 149: Hoy te imaginé dormida. Y pensé en lo frágil y fuerte que eres al mismo tiempo. Tu descanso merece calma, merece amor, merece alguien que te cuide. Y yo quiero ser eso para ti. '*Dormir al lado de alguien también es una forma de decir ‘te quiero’. *'",
  "Día 150: Hoy quiero escribirte un poema que huela a ti: a tu piel tibia, a tu risa que me desarma, a tu forma de mirarme como si entendieras mis silencios. Eres la página donde mis días encuentran sentido, donde mi vida deja de ser ruido y se vuelve canción. 'Y volvería a quererte, como la primera vez' — Morat.",
  "Día 151: Eres poema incluso cuando callas. Tienes esa magia suave que no presume pero ilumina. Eres de esas personas que uno quiere cuidar como si cargaras un universo en las manos. Si tú supieras… que cuando sonríes, algo dentro de mí se acomoda. 'Que me desordeno cuando tú me miras' — Andrés Cepeda.",
  "Día 152: Hoy escribo así: con el corazón lleno de ti, como si tu nombre fuera tinta y mis ganas fueran papel. Eres la metáfora perfecta: bonita, profunda, y peligrosamente necesaria. '‘Cause all of me loves all of you' — John Legend.",
  "Día 153: Tú eres la poesía que yo no sabía escribir hasta que llegaste. Eres verso que no se olvida, susurro que se queda, abrazo que despierta. Y sin querer, te convertiste en mi rincón favorito del mundo. 'Tú haces que mi cielo vuelva a tener ese azul' — Alejandro Sanz.",
  "Día 154: Eres ese tipo de amor bonito, ese que no grita, pero se siente. Ese que no exige, pero abraza. Eres poema que sostiene, que acompaña, que cura. 'Tan solo tú, haces latir mi corazón' — Sin Bandera.",
  "Día 155: Hoy quiero decirte que si fueras canción, serías la que pongo en repetición sin cansarme jamás. La melodía que me encuentra, la letra que me recuerda por qué vale la pena sentir. 'You’re my wonderwall' — Oasis.",
  "Día 156: Si tú fueras un poema, serías uno de esos que no terminan nunca, que uno lee despacio para no acabarlos. Te pienso así: bonita, delicada, y llena de cosas que quiero descubrir despacio. 'Quédate un ratito más' — Morat.",
  "Día 157: Eres como esas flores que crecen en lugares donde nadie creía posible. Fuerte, hermosa, resiliente, con una luz que no se apaga. Y me hace feliz que tu luz quiera quedarse un poquito conmigo. 'I could make you happy, make your dreams come true' — Ed Sheeran.",
  "Día 158: Hoy escribo de ti como quien escribe sobre algo sagrado: tus ojos, tu voz, tu forma de decir mi nombre, como si me cuidaras incluso sin tocarme. Eres poema. Y qué fortuna que seas el mío. 'Eres lo que más quiero en este mundo, eso eres' — Sin Bandera.",
  "Día 159: Si tú supieras cómo te piensa mi corazón… Te piensa lento, con cuidado, con la ternura de quien encontró algo valioso y no quiere soltarlo jamás. 'Por besarte la vida daría' — Camila.",
  "Día 160: Hoy quiero regalarte un poema que huela a calma: Eres sol suave, pero también refugio; eres caricia, pero también fuerza. Eres eso… lo que uno sueña antes de quedarse dormido. 'You’re amazing just the way you are' — Bruno Mars.",
  "Día 161: Te pienso y todo se vuelve música. Te nombro y todo se vuelve luz. Te miro y todo se ordena. Cómo haces eso… cómo haces que mi mundo deje de temblar cuando tú estás. 'Qué bello es amarte así' — Andrés Cepeda.",
  "Día 162: Si mi vida fuera un libro, tú serías el capítulo que leo despacio para que nunca se termine. Porque contigo, hasta mi futuro suena bonito. 'Love is all you need' — The Beatles.",
  "Día 163: Eres poema, pero también canción, luz, suspiro, refugio. Eres todo lo que hace que mi vida se sienta un poquito más suave. 'Voy a amarte sin prisas' — Morat.",
  "Día 164: Te pienso y escribo. Te miro y descanso. Te abrazo y me encuentro. Ojalá supieras lo bonita que eres cuando no lo sabes. Lo preciosa que te ves cuando no lo intentas. 'You’re the one that I want' — Grease.",
  "Día 165: Hoy te escribo un poema con tu nombre escondido en cada línea: en tus ojos encuentro paz, en tu sonrisa encuentro vida, en tu voz encuentro casa. Eres la canción que esperaba sin saberlo. 'Eres lo mejor que me ha pasado' — Andrés Cepeda.",
  "Día 166: Si tú fueras un verso, yo sería el papel que te sostenga. Si tú fueras viento, yo sería quien se deje llevar. Eres ese tipo de belleza que no necesita explicación. 'Everything I do, I do it for you' — Bryan Adams.",
  "Día 167: A veces siento que amarte es como escuchar mi canción favorita: me calma, me completa, me hace sentir vivo. Eres poema que abraza, y abrazo que escribe poesía. 'Dónde está el amor… ahí, en tus ojos' — Pablo Alborán.",
  "Día 168: Hoy quiero regalarte un poema sencillo: Eres bonita. Así, sin adornos. Bonita por dentro, bonita por fuera, bonita en tu esencia. Eres la calma más linda que me ha pasado. 'Say you won’t let go' — James Arthur.",
  "Día 169: Eres ese tipo de amor que inspira versos sin esfuerzo, que nace natural, que se siente limpio. Eres la flor que creció en mi pecho cuando ya no esperaba primavera. 'Te voy a querer toda la vida' — Morat.",
  "Día 170: Hoy escribo así, con el alma en la mano: Si tú fueras mi destino, yo caminaría sin miedo. Si tú fueras mi camino, yo avanzaría sin dudar. 'You’re my person' — Grey’s Anatomy.",
  "Día 171: Hay algo en ti que me hace querer ser mejor. Algo en tu mirada que me acomoda los días. Eres poema que no se lee, se siente. 'Qué suerte la mía encontrarte a ti' — Andrés Cepeda.",
  "Día 172: Hoy te escribo suave: Eres la música que calma mi guerra, el verso que cura, el suspiro que renueva. Eres mi poema favorito. 'I’m yours' — Jason Mraz.",
  "Día 173: Tienes luz. Luz real. De esa que no se apaga, de esa que sana. Y me gusta que me mires como si yo también brillara un poquito contigo. 'Quédate, que las ganas gritan tu nombre' — Morat.",
  "Día 174: Hoy escribo de ti porque no sé escribir de otra cosa últimamente. Eres poema, pero también respuesta. Eres cariño, pero también certeza. 'When I saw you, I fell in love' — Shakespeare (atribuido).",
  "Día 175: Si tú fueras lluvia, serías la que cae suave, la que uno escucha para dormir. Si fueras viento, serías el que acaricia, no el que empuja. Eres la belleza de lo simple. 'Me muero por conocerte' — Alex Ubago.",
  "Día 176: Hoy te regalo versos hechos de ti: de tu piel tibia, de tus ojos que hipnotizan, de tu risa bonita, de tu forma de sentir profundo. Eres poema perfecto. 'Tu amor me hace bien' — Marc Anthony.",
  "Día 177: A veces pienso que si el amor tuviera un rostro, sería el tuyo. Si tuviera un sonido, sería tu risa. Si tuviera una razón, serías tú. 'Can’t help falling in love' — Elvis Presley.",
  "Día 178: Hoy quiero decirte esto: eres sueño que no quiero despertar, poema que no quiero terminar, melodía que no quiero pausar. Eres todo lo que hace que los días valgan la pena. 'Y es que te quiero, te quiero y te quiero' — José Luis Perales.",
  "Día 179: Te pienso despacio, con cariño, con cuidado. Porque mereces eso: amor suave, amor bonito, amor verdadero. 'I won’t give up on us' — Jason Mraz.",
  "Día 180: Hoy te escribo como quien escribe su mejor poema: con intención, con ternura, con ganas. Eres esa parte de mi vida que se siente correcta. 'Yo no me quiero enamorar… pero contigo se me olvida' — Morat.",
  "Día 181: Si tú fueras un suspiro, serías ese que uno suelta cuando por fin encuentra paz. Eres dulce, suave, luz. Eres hogar. 'Your love is my turning page' — Sleeping at Last.",
  "Día 182: Hoy quiero darte versos: por tu forma de querer, por tu forma de mirar, por tu forma de existir. Eres poesía en estado puro. 'Contigo todo es mejor' — Andrés Cepeda.",
  "Día 183: A veces me pregunto cómo hace tu alma para ser tan bonita. Es como si hubieras sido hecha para que alguien te admire sin prisa. 'All you need is love' — The Beatles.",
  "Día 184: Hoy te escribo este poema sencillo: Eres la calma de mi tormenta, el sol de mi invierno, la canción de mi silencio. 'Si tú me miras, yo me vuelvo bonito' — Aitana (adaptado).",
  "Día 185: Te pienso, y todo se vuelve suave. Te nombro, y todo se vuelve cielo. Te miro, y todo se vuelve razón. 'I just want you close' — Alicia Keys.",
  "Día 186: Hoy quiero escribirte esto: eres la poesía más sincera que ha tocado mi vida. Si tú supieras lo que provocas… qué bonito sería. 'Yo solo quiero que me quieras' — Morat.",
  "Día 187: Eres mi poema de luz, el que abrazo sin leer, el que siento sin tocar, el que quiero sin esfuerzo. 'You are my everything' — Ariana Grande.",
  "Día 188: Hoy te escribo como quien reza: despacio, con amor, con respeto. Porque tú eres eso: bendición sin ruido. 'Si tú estás, el mundo está bien' — Andrés Cepeda.",
  "Día 189: Tu risa es poema, tu voz es verso, tu piel es canción. Todo en ti es arte. Y yo solo quiero ser quien te lea despacio. 'And darling, I will be loving you till we're 70' — Ed Sheeran.",
  "Día 190: Hoy quiero decirte esto: eres la belleza que no grita, la ternura que abraza, la luz que no cansa. 'Qué suerte la mía' — Morat.",
  "Día 191: Eres poema que se siente, verso que se queda, melodía que enamora. Eres todo lo que hace falta para escribir bonito. 'Still falling for you' — Ellie Goulding.",
  "Día 192: Hoy escribo para ti: porque tu alma merece versos, porque tu amor merece calma, porque tu luz merece abrazo. 'Tú eres la razón' — Calum Scott.",
  "Día 193: Si tú fueras un amanecer, serías ese rosado suave que hace silencio a todo el mundo. Eres belleza que no se explica, solo se siente. 'Te voy a amar hasta el final' — Sin Bandera.",
  "Día 194: Te pienso como poema, te siento como canción, te vivo como milagro. Eres todo lo bonito que jamás supe pedir. 'You’re the best thing' — James Morrison.",
  "Día 195: Hoy quiero escribirte algo claro: la vida me habló bonito contigo. Me habló en poema, me habló en calma, me habló en luz. 'Contigo la vida es vida' — Andrés Cepeda.",
  "Día 196: Eres ese tipo de amor que toca sin herir, que abraza sin pedir, que sana sin romper. Eres poema que cura. 'Thinking out loud' — Ed Sheeran.",
  "Día 197: Hoy quiero decirte: qué bonita eres… qué profundamente bonita. No solo lo que se ve, sino lo que no se ve. Lo que sientes, lo que cuidas, lo que entregas. 'Quédate conmigo' — Pastora Soler.",
  "Día 198: Eres poema que no se acaba, esos versos que uno quiere leer cuando el alma pesa. Eres todo lo que hace que mi vida suene a música. 'You’re my end and my beginning' — John Legend.",
  "Día 199: Si tú fueras estrella, serías la que guía. Si fueras agua, serías la que calma. Si fueras viento, serías el que abraza. Eres mi poesía favorita. 'Te necesito' — Amaral.",
  "Día 200: Hoy quiero darte un poema completo: Eres la flor que crece en mi pecho, la luz que acaricia mis sombras, la canción que me despierta, el susurro que me calma, el abrazo que me encuentra, el verso que me salva. Eres amor, pero también eres arte. Eres ternura, pero también eres fuerza. Y si el mundo me preguntara qué es lo más bonito que he visto, diría tu nombre sin dudarlo. 'Eres mi persona favorita' — Río Roma.",
  "Día 201: Hoy quiero recordarte algo que a veces olvidas: Eres más fuerte de lo que crees. Más valiosa de lo que imaginas. Más capaz de lo que te dices cuando estás triste. Tú puedes con todo, mi niña. Lo has demostrado una y otra vez. Y si algún día sientes que no puedes, aquí estoy yo, para sostenerte, abrazarte y recordarte lo increíble que eres. Que tengas un día hermoso, mi amorcito. Yo creo en ti… más de lo que imaginas.",
  "Día 202: Si hoy el mundo pesa, respira. Tómalo despacio, paso a paso. No tienes que ser fuerte siempre; solo tienes que ser tú, porque eso ya es suficiente. Eres una mujer maravillosa, con una luz que no se apaga. Y aunque dudes, yo no dudo ni un segundo de ti. Tú vas a lograr todo lo que te propones, solo espera y verás. Te mando un abrazo de esos que te calman el alma.",
  "Día 203: Hoy quiero decirte que estoy orgulloso de ti. De tus ganas, de tu corazón tan noble, de tu esfuerzo diario. Sé que no todo es fácil, pero tú lo haces ver posible. Tu fuerza es silenciosa, pero es real. Nunca te subestimes: eres una mujer hecha de coraje y ternura. Que tu día esté lleno de calma, mi vida. Te lo mereces.",
  "Día 204: Si supieras lo mucho que vales… No dejarías que nada ni nadie te apagaran. Hoy quiero que camines con la cabeza en alto, con la certeza de que mereces todo lo bueno. Porque lo mereces, mi niña. Por tu bondad, por tu corazón, por tu constancia. Eres una bendición para quien te conoce, y yo soy afortunado de tenerte cerquita.",
  "Día 205: Hoy quiero llenarte de cariño con estas palabras: Tú importas. Tu vida importa. Tu energía, tu luz, tu voz… todo importa. Si algún día sientes que no, recuérdate que aquí hay alguien que te piensa, te valora, te respeta, y le agradece al universo por ti. Ojalá hoy sonrías mucho, porque tu sonrisa ilumina hasta mis días malos.",
  "Día 206: Hoy no quiero que te exijas tanto. Eres humana, puedes cansarte, puedes caer, puedes soltar. Lo importante es que sigues adelante. Siempre. Y eso te hace admirable. Yo confío en ti profundamente, y estoy aquí para ti en cada paso. Ten un día ligero, mi vida bonita.",
  "Día 207: Una cosa quiero que nunca olvides: no estás sola. Tienes a alguien que te quiere con el alma, que se preocupa por ti, que piensa en ti todo el día, que quiere lo mejor para ti. Y si hoy algo se complica, si todo pesa un poquito, recuerda que tú puedes con eso y más. Eres increíble, mi amor.",
  "Día 208: Hoy amanecí pensando en tu fortaleza. A veces ni tú misma la ves, pero yo sí. Cada día. Veo cómo te esfuerzas, cómo luchas, cómo te levantas, cómo sigues aunque te duela. Ese corazón tuyo está hecho de oro. Nunca permitas que nadie te haga creer lo contrario.",
  "Día 209: Mi amor, si hoy dudas de ti, mírate un momento desde afuera: eres disciplinada, dedicada, demasiado hermosa por dentro y por fuera, y con un corazón que muchos envidiarían. Yo creo en ti, y quiero que tú también lo hagas. Que tu día sea tan bonito como tú.",
  "Día 210: A veces solo hace falta que alguien te recuerde esto: tú puedes. Siempre puedes. Lo que sea que estés enfrentando, lo vas a lograr. Porque no te rindes, porque eres fuerte, porque tienes un alma increíble. Y si te cansas, me tienes a mí.",
  "Día 211: Hoy quiero que te mires con ternura. Que te hables bonito. Que no te juzgues tanto. Eres una mujer que hace lo mejor que puede con lo que tiene, y eso ya es admirable. Yo no te miro con ojos de exigencia, te miro con amor. Con orgullo. Tu existencia ya es suficiente.",
  "Día 212: Cada vez que te sientas pequeña, recuerda esto: has superado cosas que otros no soportarían. Has brillado en días donde todo estaba oscuro. Has amado incluso cuando estabas rota. Eso te hace enorme. Eres una guerrera suave, y yo te admiro por eso.",
  "Día 213: Hoy quiero que vayas por el día con la certeza de que eres capaz de todo lo que sueñas. No te compares, no te castigues, no te desvalorices. Eres única. Eres especial. Eres suficiente. Y yo estoy aquí para recordártelo siempre.",
  "Día 214: Mi amor, tú no tienes idea de lo increíble que eres. No cuando haces cosas grandes, sino en lo pequeño: en cómo escuchas, cómo apoyas, cómo abrazas, cómo sientes. Tu forma de ser es un regalo. Nunca permitas que el mundo te haga dudar de eso.",
  "Día 215: Hoy quiero decirte que me importas. Mucho. Más de lo que imaginas. Me importa tu tristeza, tu cansancio, tu alegría, tu paz. Y quiero que tengas un día suave, de esos que dejan el corazón tranquilo. Estoy contigo. Siempre.",
  "Día 216: Si la vida se siente pesada hoy, recuerda: no tienes que cargarlo todo sola. Yo quiero acompañarte, quiero hacerte el camino más liviano, quiero recordarte quién eres cuando lo olvides. Tú vales demasiado. Tú puedes demasiado.",
  "Día 217: Eres hermosa. No por cómo te ves, sino por cómo eres. Por tu alma grande, tu sensibilidad, tu autenticidad. Esa combinación tuya no la tiene cualquiera. Eres especial, mi niña. Muy especial.",
  "Día 218: Quiero que hoy te trates bonito. Que te hables con cariño. Que te recuerdes que eres suficiente, justo como eres. No necesitas ser perfecta para ser valiosa. Ya lo eres. Y demasiado.",
  "Día 219: No tengas miedo del futuro, mi amor. Lo vas a lograr todo. Eres dedicada, inteligente, fuerte, y tienes un corazón capaz de construir lo que sueña. Yo estoy orgulloso de ti por todo lo que ya eres y por todo lo que estás creciendo a ser.",
  "Día 220: Hoy quiero que sepas algo: estoy aquí. Para ti. En lo bueno, lo malo, lo simple, lo complicado. No tienes que estar sola en nada. Yo te acompaño, te escucho, te abrazo, te apoyo. Lo que necesites… aquí estoy.",
    "Día 221: Mi linda, camina con la frente en alto; tienes todo lo necesario para salir adelante.",
    "Día 222: Mi amor, que nadie te haga dudar de tu luz; eres más fuerte de lo que te imaginas.",
    "Día 223: Mi luna, respira hondo: hoy es un nuevo intento y tú tienes lo que hace falta para lograrlo.",
    "Día 224: Mi pingui, si hoy la sonrisa se te esconde, búscala igual — se te ve hermosa cuando aparece.",
    "Día 225: Mi preciosa, no temas pedir ayuda: pedir apoyo también es valentía y te hace aún más grande.",
    "Día 226: Mi gg, pequeña pausa: date permiso para descansar; regenerarte es parte de ganar.",
    "Día 227: Mi geral, cada paso que das cuenta; aunque sean pasos chiquitos, estás avanzando siempre.",
    "Día 228: Mi niña, confía en tu intuición; esa voz tuya sabe más de lo que crees.",
    "Día 229: Mi linda, el mundo necesita tu forma de ser — tu ternura y tu fuerza importan.",
    "Día 230: Mi amor, recuerda: los tropiezos son lecciones, no etiquetas. Levántate con más ganas.",
    "Día 231: Mi luna, hoy te mando un recordatorio: eres capaz de transformar lo difícil en oportunidad.",
    "Día 232: Mi pingui, cuando dudes, vuelve a lo básico: respira, camina, vuelve a intentarlo. Yo te acompaño.",
    "Día 233: Mi preciosa, mereces que te hablen bonito. Empieza por hablarte bonito tú misma: 'lo estoy haciendo bien'.",
    "Día 234: Mi gg, no tienes que hacerlo todo perfecto; tu intentarlo ya es un triunfo.",
    "Día 235: Mi geral, hoy piensa en tres cosas que lograste la semana pasada; verás que eres más capaz de lo que crees.",
    "Día 236: Mi niña, tu risa es una herramienta poderosa: úsala hoy para romper la tensión y crear espacio para lo bueno.",
    "Día 237: Mi linda, si el día pesa, divide la carga en partes pequeñas. Paso a paso, llegas.",
    "Día 238: Mi amor, recuerda este mantra: 'puedo, lo intento, sigo'. Dilo en voz baja cuando te falte confianza.",
    "Día 239: Mi luna, eres constancia hecha persona; lo que hoy parece lento será grande mañana.",
    "Día 240: Mi pingui, no tengas prisa por tenerlo todo; tu proceso tiene su propio ritmo y es hermoso.",
    "Día 241: Mi preciosa, vales por lo que eres, no por lo que das. Tómate tu espacio para recargar.",
    "Día 242: Mi gg, hoy deseo que te sorprendas con tu propia fuerza. Tú puedes con esto y con mucho más.",
    "Día 243: Mi geral, hoy recuerda quién eres: una persona noble, capaz y llena de luz. No lo olvides.",
    "Día 244: Mi niña, hoy te dedico esta línea: 'sigue, que lo mejor aún te espera'. Cree en ello.",
    "Día 245: Mi linda, cada desafío es una oportunidad para mostrarte lo valiente que eres. Yo ya lo vi.",
    "Día 246: Mi amor, cuando algo te frene, pregúntate: ¿qué pequeño paso puedo dar ahora? Hazlo y verás la diferencia.",
    "Día 247: Mi luna, hoy piensa: 'mi corazón sabe levantarse'. Repite eso y déjalo calar.",
    "Día 248: Mi pingui, recuerda: no estás obligada a cargar sola lo que nos compete a dos. Permíteme ayudarte siempre.",
    "Día 249: Mi preciosa, hoy el mundo puede ser amable contigo: acepta lo bueno que llegue sin miedo.",
    "Día 250: Mi gg / Mi geral, cierra el día sabiendo que diste lo mejor según tu momento. Mañana renace la oportunidad.",
    "Día 251: Blanquita hermosa, hoy quiero que recuerdes esto: tú puedes con todo, incluso con lo que crees que no. Yo creo en ti con el alma.",
    "Día 252: Tu piel clarita y tu sonrisa son la prueba de que la belleza también puede ser suave y luminosa. Eres un encanto.",
    "Día 253: Mi niña linda, hoy deseo que te vaya increíble. Si algo te pesa, piensa en esto: no estás sola, me tienes.",
    "Día 254: Eres capaz, fuerte, inteligente y preciosa. No dejes que nada ni nadie te haga dudarlo.",
    "Día 255: Tu mirada tiene ese algo que calma. Gracias por existir, mi blanquita linda.",
    "Día 256: Hoy te deseo un día ligerito, lleno de paz, como tu piel suave y clarita cuando la acaricio con los ojos.",
    "Día 257: 'Lo bonito de ti es que sigues brillando incluso cuando no te das cuenta.' — Y es verdad, amor mío.",
    "Día 258: Tu sonrisa es ese tipo de cosa que hace mejor cualquier día. Literal, cualquier día.",
    "Día 259: Mi niña, recuerda: lo que hoy parece difícil, mañana ya no. Tú puedes con todo.",
    "Día 260: Eres linda por fuera, pero por dentro… uf. Te llevo en mi pecho hoy más que nunca.",
    "Día 261: Mi fresita blanca, hoy solo quiero decirte: qué suerte la mía coincidir contigo.",
    "Día 262: No sé cómo explicarlo, pero tú haces que todo lo malo pese menos.",
    "Día 263: Eres tan capaz, tan fuerte, tan increíble… solo necesitas creerlo un poquito más.",
    "Día 264: Hoy te mando un abrazo mental y un 'tú puedes' gigante.",
    "Día 265: Mi niña linda, que nada te frene hoy. Eres una mujer que puede con todo.",
    "Día 266: 'Eres suficiente. Siempre lo has sido.' A veces hay que recordarlo.",
    "Día 267: Tu carita blanca y tierna es mi punto débil favorito.",
    "Día 268: Hoy deseo que sonrias, aunque sea tantito. Esa sonrisa tuya vale el mundo entero.",
    "Día 269: Mi amorcito, recuerda que cada día es una oportunidad para demostrarte a ti misma lo fuerte que eres.",
    "Día 270: Eres hermosa sin esfuerzo. Sin intentarlo. Solo siendo tú.",
    "Día 271: Ojalá hoy el universo te abrace tan fuerte como yo quiero hacerlo.",
    "Día 272: Mi niña blanca, delicada y fuerte, hoy vas a brillar. Lo sé.",
    "Día 273: 'Que nunca te falte fe en ti misma.' — Hoy te lo regalo en forma de mensaje.",
    "Día 274: Eres la belleza en su forma más suave. Y la fuerza en su forma más tierna.",
    "Día 275: Solecito, hoy deseo que tu mente esté ligerita. Respira. Tú puedes.",
    "Día 276: Eres arte. No lo olvides. Y el arte nunca deja de ser valioso.",
    "Día 277: Mi gaticita linda, mereces todo lo bonito del mundo.",
    "Día 278: Hoy quiero que te mires al espejo y digas: 'estoy orgullosa de mí'. Porque yo sí lo estoy.",
    "Día 279: Eres tan especial que hasta los días malos se suavizan si pienso en ti.",
    "Día 280: Tu piel blanca y suave es un poema silencioso. Y tu alma… es la parte más bonita.",
    "Día 281: Canción del día: 'La Mitad' – Camilo & Evaluna. Porque contigo todo se siente completo.",
    "Día 282: Eres capaz de lograr lo que te propongas. Lo digo yo, que te he visto crecer.",
    "Día 283: Mi niña linda, ojalá hoy te sientas tan valiosa como realmente eres.",
    "Día 284: No hay nada más tierno que tú cuando ríes. Nada.",
    "Día 285: Hoy te deseo calma, paz y un motivo para sonreír. (Eres tú, por cierto.)",
    "Día 286: Mi fresita, no olvides: lo que tú eres no se encuentra fácil. Eres única.",
    "Día 287: Cuando te sientas cansada, piensa en esto: yo creo en ti, incluso en los días que tú no.",
    "Día 288: Tu belleza es tranquila, como luz suave entrando por una ventana.",
    "Día 289: Eres una guerrera silenciosa, de esas que no presumen, pero avanzan.",
    "Día 290: Mi niña blanca, hoy te mando un 'yo estoy contigo', porque de verdad lo estoy.",
    "Día 291: Eres el tipo de persona que hace mejor el mundo sin darse cuenta.",
    "Día 292: Blanquita hermosa, hoy vas a poder, aunque parezca difícil. Lo sé.",
    "Día 293: Tu alma es tan bonita que a veces me quedo sin palabras.",
    "Día 294: Mi gaticita, tú mereces descanso, cariño y cosas lindas. Ojalá hoy recibas todo eso.",
    "Día 295: Eres un milagrito chiquito y precioso. Y yo vivo agradecido por encontrarte.",
    "Día 296: No importa lo que pase hoy: tú sigues siendo suficiente, hermosa y fuerte.",
    "Día 297: Eres luz. Y la luz nunca deja de brillar.",
    "Día 298: Canción del día: 'Bachata Rosa' — Juan Luis Guerra. Porque tú eres una ternura hecha persona.",
    "Día 299: Si hoy te sientes chiquita, recuerda: yo te acompaño, te abrazo y te cuido.",
    "Día 300: Mi niña bonita, blanca como luna suave: vas a lograr todo, absolutamente todo. Y mientras tanto… yo te admiro.",
    "Día 301: Mi linda, tú eres ese poema que no estaba buscando, pero que cuando apareció, entendí que lo necesitaba. A veces te miro —aunque no lo notes— y pienso: 'Yo te quiero no por quién eres, sino por quién soy cuando estoy contigo.' Y contigo soy paz. Soy alguien que quiere quedarse.",
    "Día 302: Mi amor, hoy quiero dedicarte esta línea: 'Tú, que me elevas cuando apenas puedo andar.' Tienes esa capacidad rara de hacerme sentir suficiente, de mirarme como si yo fuera alguien valioso. Y por eso, te quiero.",
    "Día 303: Mi luna, si tú fueras un poema serías uno de Benedetti, de esos que se guardan en el bolsillo y se leen cuando la vida aprieta. De esos que calman y que abrazan. Tu voz, tu risa, tu forma de ser… todo en ti es una caricia para mis días.",
    "Día 304: Mi pingui, tú eres lo más parecido a un milagro cotidiano. Yo te miro y pienso: 'Ojalá supiera decirle cuánto la quiero sin que las palabras se me queden pequeñas.' Desde que llegaste, no sé despedirme. Eso eres tú para mí: lo que no quiero soltar.",
    "Día 305: Mi preciosa, hoy amanecí pensando que si tus ojos fueran canción, serían una de esas que uno escucha en silencio porque cada nota le aprieta el corazón sin hacerlo daño. 'Tú eres mi lugar seguro, aunque no lo sepas.' Y ojalá te lo pueda demostrar cada día.",
    "Día 306: Mi gg, hoy quiero escribir algo que te mereces escuchar: Amarte no me pesa. Amarte me salva. Sé que el mundo a veces te exige más de lo que deberías dar, pero cuando vuelves a mí con tus palabras suaves, siento que todo vale la pena.",
    "Día 307: Mi geral, tú eres la suma de todo lo bonito que nunca pensé tener. Tu risa, tu manera de ser, tu dulzura… Todo en ti me hace quererte más. Me salvó la belleza de mirarte. Y es real. Tus ojos me salvan.",
    "Día 308: Mi niña, hoy te escribo con el corazón abierto: me importas más de lo que puedo explicar. Me importas en tus días fuertes, pero sobre todo en tus días cansados, porque ahí es donde quiero abrazarte más.",
    "Día 309: Mi linda, si tú supieras cuántas veces pienso en ti al día… cuántas veces me quedo recordando tu voz, tu forma de decir mi nombre, tu forma de cuidarme sin hacerlo notar. Eres poema caminando. Eres ternura respirando.",
    "Día 310: Mi amor, hoy quiero dejarte un verso: 'Amar es esto: quedarse sin razones y seguir sintiendo.' Y eso me pasa contigo. No sé explicarlo, pero tú me haces querer quedarme, querer cuidarte, querer darte lo mejor de mí.",
    "Día 311: Mi luna, tú eres esa luz tibia que no encandila, pero que hace que uno no tropiece. Ojalá la vida te trate tan bonito como tú me tratas a mí. Eso deseo para ti hoy.",
    "Día 312: Mi pingui, te tengo cariño del bueno, del que no espera nada, del que simplemente es. Me gustas cuando ríes, pero también cuando estás seria, cuando piensas, cuando dudas… Eres hermosa en todas tus formas.",
    "Día 313: Mi preciosa, hoy quiero darte estas líneas: 'Tú eres mi presente favorito.' No me importa el pasado, ni tengo miedo del futuro cuando te pienso a ti.",
    "Día 314: Mi gg, ¿sabes qué es bonito contigo? Que todo parece posible. Que incluso en mis días oscuros, tú encuentras un modo de iluminarme. Tú haces fácil lo difícil.",
    "Día 315: Mi geral, quiero que recuerdes esto hoy: te quiero por ser tú. Por tu corazón, por tu alma, por tu esencia. No tienes idea de cuánto te valoro.",
    "Día 316: Mi niña, si pudiera escribirte un libro entero lo haría, pero por ahora te dejo este fragmento: 'Las personas como tú no se encuentran dos veces en la vida.' Tú eres única. Inigualable. Irremplazable.",
    "Día 317: Mi linda, tu forma de amar es tan suave que nunca tuve miedo contigo. Eso es raro. Eso es especial. Eso es tuyo.",
    "Día 318: Mi amor, hoy quiero dejarte un poema pequeñito: 'Si supieras, amor, que mi alma te reconoce antes que mis ojos.' Así te siento yo.",
    "Día 319: Mi luna, eres mi persona favorita sin esfuerzo. No hiciste nada especial, solo fuiste tú, y eso fue suficiente para enamorarme.",
    "Día 320: Mi pingui, quiero que sepas algo importante: me encanta cómo sientes. Cómo te preocupas por todo, cómo cuidas, cómo abrazas incluso con palabras. Eres hermosa por dentro y por fuera.",
    "Día 321: Mi preciosa, tú eres ese 'quédate' que yo nunca le dije a nadie. Contigo no me da miedo apostar, porque tú vales la pena.",
    "Día 322: Mi gg, hoy quiero decirte que te admiro. Admiro tu fuerza, tu ternura, tu capacidad para volver a empezar.",
    "Día 323: Mi geral, eres una bendición con forma de sonrisa. No sé qué hice para merecerte, pero prometo cuidarte.",
    "Día 324: Mi niña, hoy te dejo una frase de amor puro: 'El mundo es menos mundo cuando no estás tú.' Eso siento cuando te extraño.",
    "Día 325: Mi linda, tú eres hogar. No un lugar, sino una sensación. Una certeza. Un abrazo que no se olvida.",
    "Día 326: Mi amor, tu voz tiene algo especial: me calma, me centra, me recuerda que todo está bien.",
    "Día 327: Mi luna, tú eres poesía en movimiento. Cada gesto tuyo tiene algo que me derrite.",
    "Día 328: Mi pingui, si pudiera pedir un deseo, sería seguir viéndote crecer, superar cosas, brillar. Porque te lo mereces.",
    "Día 329: Mi preciosa, quiero que sepas que sí te quiero, y mucho, con esa fuerza suave que no agobia, pero que acompaña.",
    "Día 330: Mi gg, hoy te dedico esta línea: 'Dónde sea, pero contigo.'",
    "Día 331: Mi geral, tú eres la persona que me hace sonreír incluso cuando no quiero. Eso solo lo logra alguien especial.",
    "Día 332: Mi niña, me importas tanto que a veces me asusta lo mucho que te pienso. Pero es bonito. Es bonito quererte así.",
    "Día 333: Mi linda, eres un poema que no sabe que lo es, que camina por el mundo sin darse cuenta de lo hermosa que resulta.",
    "Día 334: Mi amor, hoy te dejo esta frase: 'No sabía que necesitaba ternura, hasta que te conocí.'",
    "Día 335: Mi luna, tu forma de mirar es un abrazo silencioso. Ojalá siempre me mires así.",
    "Día 336: Mi pingui, quiero ser alguien que te sume, que te cuide, que te haga sentir segura. Porque tú mereces lo mejor.",
    "Día 337: Mi preciosa, ¿sabes qué me encanta de ti? Que todo en ti es verdad. Nada es fachada, todo es corazón.",
    "Día 338: Mi gg, hoy quiero que leas esto con calma: te quiero sin prisa, sin medida y sin miedo.",
    "Día 339: Mi geral, tú eres la parte más suave de mis días duros. Gracias por existir.",
    "Día 340: Mi niña, hoy pienso que tu sonrisa es una especie de milagro chiquito que aparece sin avisar.",
    "Día 341: Mi linda, tú eres mi motivo favorito para ser alguien mejor.",
    "Día 342: Mi amor, tu risa… qué cosa tan hermosa. Es como luz en movimiento. Como un poema que se escucha.",
    "Día 343: Mi luna, quiero que sepas algo: tú mereces amor bonito, amor paciente, amor que abraza. Eso quiero darte.",
    "Día 344: Mi pingui, tú eres esa coincidencia preciosa que cambió todo sin hacer ruido.",
    "Día 345: Mi preciosa, me importas tanto que a veces siento que el corazón se me queda corto para decirlo.",
    "Día 346: Mi gg, hoy quiero dejarte esta frase: 'Amarte es fácil cuando eres tú.'",
    "Día 347: Mi geral, qué suerte la mía de encontrarte en un mundo tan grande.",
    "Día 348: Mi niña, tú eres la ternura que yo no sabía que necesitaba.",
    "Día 349: Mi linda, si pudiera abrazarte el alma, créeme que lo haría. Porque tú mereces descanso.",
    "Día 350: Mi amor, hoy cierro este tramo con un poema: 'Tú, que llegaste sin prometer nada, y aún así te convertiste en mi promesa favorita.'",
    "Día 351: Mi niña, hoy quiero decirte algo que quizá nunca te he explicado así: tú eres mi paz y mi desastre favorito al mismo tiempo. Mi calma cuando todo está mal, y mi desorden bonito cuando todo está bien. Hay personas que uno quiere sin darse cuenta, y contigo fue así: un cariño que empezó suave y terminó siendo hogar. Tú eres esa persona a la que quiero cuidar incluso en silencio.",
    "Día 352: Mi linda, hoy amanecí con una certeza: qué fortuna la mía coincidir contigo en esta vida. A veces pienso en tus manos, en lo frágiles y fuertes que son al mismo tiempo, y me dan ganas de prometerte cosas, de quedarme, de ser alguien que te sostenga cuando el mundo te canse. Eres tan hermosa que a veces duele, pero un dolor bonito, como cuando uno recuerda algo que le hace bien.",
    "Día 353: Mi amor, hoy quiero regalarte un pensamiento: si el mundo te tira al piso, yo me tiro contigo, pero para levantarte. Tú no estás sola. Ni lo estarás mientras yo tenga fuerzas. Me inspiras. Me llenas. Me haces querer algo tan simple y tan grande a la vez: que seas feliz, aunque a veces no lo veas.",
    "Día 354: Mi luna, hoy quiero escribirte un poema pequeño pero verdadero: 'A veces me pierdo, pero si estás tú, siempre encuentro camino.' Tienes algo que me salva. Algo que yo no sabía que necesitaba, pero que ahora no quiero perder por nada del mundo. Tú eres luz, incluso cuando dudas de ti.",
    "Día 355: Mi pingui, hoy te pienso con ternura… de esa ternura que no empalaga, que no ahoga, pero que abriga. Me gusta cómo existes, cómo sientes, cómo luchas, cómo te paras incluso cuando temblas. Quiero que lo sepas: yo te admiro. Mucho. Y te quiero aún más.",
    "Día 356: Mi preciosa, hoy quiero que leas esto lento: tú eres suficiente. Eres completa. Eres grande. Eres magia. No te compares. No te disminuyas. No te quiebres por cosas que un día no importarán. La vida te hizo fuerte, pero tú te hiciste increíble.",
    "Día 357: Mi gg, hoy quiero contarte algo que siempre siento: cuando te miro, cuando te escucho, cuando me dices 'pollo' o 'zamu', yo siento un cariño tan profundo que no me cabe en el pecho. No sé si es amor, destino o suerte… solo sé que contigo todo se siente bonito.",
    "Día 358: Mi geral, hoy quiero dejarte una frase que se me viene cada vez que pienso en ti: 'Quédate donde te quieran sin pedirte que seas menos.' Y tú, mi niña, mereces que te quieran completa: con tus miedos, tus enojitos, tu risa, tu forma tan tuya de ver el mundo. Aquí yo te quiero así. Sin reducirte.",
    "Día 359: Mi niña, hoy te dejo un poema hecho para ti: 'Si la vida fuera justa, te daría mil motivos para sonreír. Pero como no lo es, déjame ser yo, al menos uno.' No te imaginas lo que te quiero. Lo que te valoro. Lo que me importas.",
    "Día 360: Mi linda, a cinco días del final, quiero decirte algo que ya sabes pero que merece repetirse: tú le das sentido a muchas cosas que antes solo pasaban porque sí. Tus ojos tienen esa chispa, tu voz tiene ese toque, tu risa tiene ese efecto que arregla días enteros. Ojalá supiera describirte sin quedarme corto. Pero lo intento cada día, y seguiré intentando siempre.",
    "Día 361: Mi amor, hoy quiero dedicarte una frase que te queda perfecta: 'Dónde tú estés, ahí quiero estar yo.' Es tan sencillo como eso. No porque te necesite, sino porque contigo la vida se siente más calientica, más suave, más real.",
    "Día 362: Mi luna, hoy te dejo un pensamiento que lleva tu nombre: 'Si tengo tu voz, no me falta nada.' Tú eres compañía incluso cuando estás en silencio. Eres abrazo incluso sin tocarme. Eres cariño sin pedir nada a cambio. Contigo, el mundo duele menos. Y eso vale oro.",
    "Día 363: Mi pingui, hoy te regalo un trocito de alma: 'Hay personas que llegan como sol después de una tormenta. Tú llegaste como un amanecer después de un año de noches.' Eso fuiste para mí. Y sigues siendo. No sabes cuánto.",
    "Día 364: Mi preciosa, un día antes del último, quiero decirte algo que llevo días sintiendo: Contigo quiero quedarme. Contigo quiero crecer. Contigo quiero sanar. Contigo quiero lo bonito, lo simple, lo real. No eres una etapa. No eres un rato. Eres lo que quiero cuidar.",
    "Día 365: Feliz cumpleaños mi vida. Tantos días pasaron pero al final de todos estos días me di cuenta que te sigo queriendo menos que más que ayer y menos que mañana. Te quiero. Te quiero de verdad. Te quiero suave pero firme. Te quiero bonito. Te quiero completo. Te quiero como quien elige, no como quien pasa."
  ];

  // --- DOM references ---
  const bdayList = document.getElementById('bday-list');
  const comfortList = document.getElementById('comfort-list');
  const loveList = document.getElementById('love-list');
  const btnRandomBday = document.getElementById('btn-random-bday');
  const btnPrint = document.getElementById('btn-print');

  // --- Helper to create message elements ---
  function createMessageElement(text, allowCopy = true) {
    const wrap = document.createElement('div');
    wrap.className = 'msg';
    const p = document.createElement('div');
    p.textContent = text;
    wrap.appendChild(p);

    if (allowCopy) {
      const actions = document.createElement('div');
      actions.className = 'actions';

      const btnCopy = document.createElement('button');
      btnCopy.className = 'small-action';
      btnCopy.textContent = 'Copiar';
      btnCopy.addEventListener('click', () => {
        navigator.clipboard?.writeText(text).then(() => {
          btnCopy.textContent = 'Copiado';
          setTimeout(() => btnCopy.textContent = 'Copiar', 1400);
        }).catch(() => {
          btnCopy.textContent = 'No disponible';
          setTimeout(() => btnCopy.textContent = 'Copiar', 1400);
        });
      });

      const btnShare = document.createElement('button');
      btnShare.className = 'small-action';
      btnShare.textContent = 'Seleccionar';
      btnShare.addEventListener('click', () => {
        // selecciona el texto para que el usuario pueda copiar/manual
        const range = document.createRange();
        range.selectNodeContents(p);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });

      actions.appendChild(btnCopy);
      actions.appendChild(btnShare);
      wrap.appendChild(actions);
    }

    return wrap;
  }

  // --- Render lists ---
  function renderLists() {
    bdayList.innerHTML = '';
    comfortList.innerHTML = '';
    loveList.innerHTML = '';

  // TARJETA 1 → no mostrar acciones (se quitaron a petición)
  birthdayMessages.forEach(msg => bdayList.appendChild(createMessageElement(msg, false)));

    // TARJETA 2 → NO copiar, NO seleccionar
    comfortMessages.forEach(msg => comfortList.appendChild(createMessageElement(msg, false)));

    // TARJETA 3 → NO copiar, NO seleccionar
    loveNotes.forEach(msg => loveList.appendChild(createMessageElement(msg, false)));
  }

  renderLists();

  // --- Calendar System (365 days: Nov 17, 2025 to Nov 17, 2026) - Month by Month ---
  const startDate = new Date(2025, 10, 17); // Nov 17, 2025
  const endDate = new Date(2026, 10, 17);   // Nov 17, 2026
  const calendarDiv = document.getElementById('calendar');
  const messageDisplayDiv = document.getElementById('message-display');
  const currentMonthDiv = document.getElementById('current-month');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');

  let currentDisplayMonth = new Date(2025, 10, 17); // Start in Nov 2025

  function getDayNumber() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 ? Math.min(diffDays, 364) : -1;
  }

  function getDateFromDayNumber(dayNum) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNum);
    return date;
  }

  function getDayNumberFromDate(date) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    const diffTime = d - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 ? Math.min(diffDays, 364) : -1;
  }

  function getMonthName(date) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[date.getMonth()] + ' ' + date.getFullYear();
  }

  function renderCalendar() {
    if (!calendarDiv) return;
    calendarDiv.innerHTML = '';

    const today = getDayNumber();
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // Obtener primer día del mes actual a mostrar
    const monthStart = new Date(currentDisplayMonth.getFullYear(), currentDisplayMonth.getMonth(), 1);
    // Obtener último día del mes
    const monthEnd = new Date(currentDisplayMonth.getFullYear(), currentDisplayMonth.getMonth() + 1, 0);

    // Actualizar título del mes
    if (currentMonthDiv) {
      currentMonthDiv.textContent = getMonthName(currentDisplayMonth);
    }

    // Para noviembre 2025, empezar desde día 17 (no mostrar 1-16)
    // Para noviembre 2026, mostrar solo hasta día 17
    const isNov2025 = currentDisplayMonth.getMonth() === 10 && currentDisplayMonth.getFullYear() === 2025;
    const isNov2026 = currentDisplayMonth.getMonth() === 10 && currentDisplayMonth.getFullYear() === 2026;
    
    let startDay = 1;
    let endDay = monthEnd.getDate();
    
    if (isNov2025) {
      startDay = 17;
    }
    if (isNov2026) {
      endDay = 17;
    }
    
    // Celdas vacías al inicio (excepto para nov 2025 que tiene inicio en 17)
    let firstDayOfWeek = monthStart.getDay();
    // Convertir domingo (0) a 6, lunes (1) a 0, etc. (formato: Lu=0, Ma=1, ..., Do=6)
    firstDayOfWeek = (firstDayOfWeek + 6) % 7;
    
    if (!isNov2025) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day-empty';
        calendarDiv.appendChild(emptyCell);
      }
    } else {
      // Para nov 2025, calcular celdas vacías basado en el día 17
      const nov17 = new Date(2025, 10, 17);
      const nov17DayOfWeek = (nov17.getDay() + 6) % 7;
      for (let i = 0; i < nov17DayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day-empty';
        calendarDiv.appendChild(emptyCell);
      }
    }

    // Crear botones para cada día del mes
    for (let dayOfMonth = startDay; dayOfMonth <= endDay; dayOfMonth++) {
      const cellDate = new Date(currentDisplayMonth.getFullYear(), currentDisplayMonth.getMonth(), dayOfMonth);
      cellDate.setHours(0, 0, 0, 0);
      
      const dayNum = getDayNumberFromDate(cellDate);
      
      const dayBtn = document.createElement('button');
      dayBtn.className = 'calendar-day';
      dayBtn.setAttribute('data-day', dayOfMonth);
      dayBtn.textContent = dayOfMonth;

        // Verificar si el día está disponible (respeta el modo "desbloqueo total")
        const available = unlockedAll ? (dayNum >= 0 && dayNum <= 364) : (dayNum >= 0 && dayNum <= today);

        if (available) {
          // Día disponible
          dayBtn.classList.add('available');
          if (cellDate.getTime() === todayDate.getTime()) {
            dayBtn.classList.add('today');
          }

          dayBtn.addEventListener('click', () => {
            displayMessage(dayNum, true);
          });
        } else if (dayNum < 0 || dayNum > 364) {
          // Día fuera del rango (antes de Nov 17, 2025 o después de Nov 17, 2026)
          dayBtn.classList.add('locked');
          dayBtn.textContent = '✕';
          dayBtn.title = 'Este día no está en el rango';
          dayBtn.addEventListener('click', () => {
            showLockedDayMessage(dayOfMonth);
          });
        } else {
          // Día futuro (bloqueado por fecha)
          dayBtn.classList.add('locked');
          dayBtn.textContent = '✕';
          dayBtn.title = 'Este día aún no está disponible';
          dayBtn.addEventListener('click', () => {
            showLockedDayMessage(dayOfMonth);
          });
        }

      calendarDiv.appendChild(dayBtn);
    }

    // Mostrar el mensaje del día actual
    const currentDayNum = getDayNumber();
    displayMessage(currentDayNum >= 0 ? currentDayNum : 0);
  }

  function displayMessage(dayNum, closeCalendar = false) {
    if (!messageDisplayDiv) return;

    if (dayNum < 0) {
      messageDisplayDiv.innerHTML = '<p class="empty">El calendario comenzará el 17 de noviembre de 2025 ✨</p>';
      messageDisplayDiv.classList.add('empty');
      return;
    }

    const message = dailyMessages[dayNum] || 'Mensaje no disponible';
    messageDisplayDiv.innerHTML = message;
    messageDisplayDiv.classList.remove('empty');
    messageDisplayDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // Actualizar la fecha mostrada junto al botón
    if (selectedDateSpan) {
      const d = getDateFromDayNumber(dayNum);
      selectedDateSpan.textContent = formatDate(d);
    }
    
    // Cerrar el calendario solo si se seleccionó un día específicamente (closeCalendar = true)
    if (closeCalendar && calendarContainer && !calendarContainer.classList.contains('calendar-hidden')) {
      toggleCalendar();
    }
  }

  function showLockedDayMessage(dayOfMonth) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = 0;
    overlay.style.background = 'rgba(20, 10, 30, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9998;
    overlay.style.backdropFilter = 'blur(2px)';

    // Crear card del mensaje
    const card = document.createElement('div');
    card.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))';
    card.style.padding = '32px 28px';
    card.style.borderRadius = '16px';
    card.style.maxWidth = '420px';
    card.style.width = '90%';
    card.style.textAlign = 'center';
    card.style.boxShadow = '0 20px 60px rgba(33, 20, 60, 0.25)';
    card.style.border = '2px solid rgba(255, 111, 191, 0.2)';
    card.style.animation = 'slideIn 0.3s ease';

    const title = document.createElement('p');
    title.style.fontSize = '1.4rem';
    title.style.fontWeight = '700';
    title.style.color = '#7c49ff';
    title.style.marginBottom = '12px';
    title.textContent = 'No puedes ver este mensajito aún';

    const message = document.createElement('p');
    message.style.fontSize = '1rem';
    message.style.color = '#241332';
    message.style.lineHeight = '1.6';
    message.style.marginBottom = '24px';
    message.innerHTML = `Amor mío, el día <strong style="color: #ff6fbf;">${dayOfMonth}</strong> aún no llega… debes esperar a ese día para verlo. Te quiero muchototote mi niña impaciente jeje<br><br>Besoss preciosaa!`;

    const btnClose = document.createElement('button');
    btnClose.textContent = 'De acuerdo mi pollo <33';
    btnClose.style.background = 'linear-gradient(135deg, #7c49ff, #ff6fbf)';
    btnClose.style.color = 'white';
    btnClose.style.border = 'none';
    btnClose.style.padding = '12px 28px';
    btnClose.style.borderRadius = '10px';
    btnClose.style.fontSize = '0.95rem';
    btnClose.style.fontWeight = '600';
    btnClose.style.cursor = 'pointer';
    btnClose.style.transition = 'transform 0.2s ease';
    btnClose.addEventListener('mouseenter', () => {
      btnClose.style.transform = 'scale(1.05)';
    });
    btnClose.addEventListener('mouseleave', () => {
      btnClose.style.transform = 'scale(1)';
    });
    btnClose.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    card.appendChild(title);
    card.appendChild(message);
    card.appendChild(btnClose);
    overlay.appendChild(card);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    document.body.appendChild(overlay);
  }

  // --- Toggle Calendar Dropdown ---
  const toggleCalendarBtn = document.getElementById('toggle-calendar');
  const calendarContainer = document.getElementById('calendar-container');
  const selectedDateSpan = document.getElementById('selected-date');
  const unlockAllBtn = document.getElementById('unlock-all');
  let unlockedAll = false;

  function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  
  function toggleCalendar() {
    if (calendarContainer) {
      calendarContainer.classList.toggle('calendar-hidden');
      
      if (toggleCalendarBtn) {
        if (calendarContainer.classList.contains('calendar-hidden')) {
          toggleCalendarBtn.textContent = 'Abrir calendario 📖';
          toggleCalendarBtn.classList.remove('active');
        } else {
          toggleCalendarBtn.textContent = 'Cerrar calendario 📖';
          toggleCalendarBtn.classList.add('active');
        }
      }
    }
  }
  
  if (toggleCalendarBtn) {
    toggleCalendarBtn.addEventListener('click', toggleCalendar);
  }

  // Unlock-all toggle: muestra todos los días (incluyendo futuros) cuando está activo
  if (unlockAllBtn) {
    unlockAllBtn.addEventListener('click', () => {
      // Si ya está desbloqueado, permite volver a bloquear sin pedir clave
      if (unlockedAll) {
        unlockedAll = false;
        unlockAllBtn.classList.remove('active');
        unlockAllBtn.textContent = 'Desbloquear todos';
        renderCalendar();
        showPopup('Modo bloqueo por fecha activado. Volvimos a bloquear los días futuros.');
        return;
      }

      // Pedir clave para desbloquear todo (clave: 9118)
      const code = window.prompt('Introduce la clave para desbloquear todos los días (4 dígitos):');
      if (code === null) return; // usuario canceló

      if (String(code).trim() === '9118') {
        unlockedAll = true;
        unlockAllBtn.classList.add('active');
        unlockAllBtn.textContent = 'Bloquear por fecha';
        renderCalendar();
        showPopup('¡Listo! Todos los días quedan desbloqueados.');
      } else {
        showPopup('Clave incorrecta. Intenta de nuevo.');
      }
    });
  }

  // Event listeners para navegación de meses
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() - 1);
      // No permitir ir antes de Nov 2025
      if (currentDisplayMonth < new Date(2025, 10, 1)) {
        currentDisplayMonth = new Date(2025, 10, 17);
      }
      renderCalendar();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() + 1);
      // No permitir ir después de Nov 2026
      if (currentDisplayMonth > new Date(2026, 10, 31)) {
        currentDisplayMonth = new Date(2026, 10, 17);
      }
      renderCalendar();
    });
  }

  renderCalendar();

  // --- Show 100 reasons modal ---
  function show100ReasonsModal() {
    // crear overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = 0;
    overlay.style.background = 'rgba(20,10,30,0.45)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    const card = document.createElement('div');
    card.style.maxWidth = '680px';
    card.style.width = '92%';
    card.style.maxHeight = '80vh';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.padding = '26px';
    card.style.borderRadius = '16px';
    card.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.9))';
    card.style.boxShadow = '0 18px 60px rgba(36,19,50,0.4)';
    card.style.color = '#331c3f';

    const h = document.createElement('h2');
    h.textContent = '100 razones por las que soy feliz contigo';
    h.style.margin = '0 0 16px 0';
    h.style.fontSize = '1.3rem';
    h.style.fontFamily = 'Sacramento, Poppins, serif';
    h.style.textAlign = 'center';
    card.appendChild(h);

    const listContainer = document.createElement('div');
    listContainer.style.overflowY = 'auto';
    listContainer.style.paddingRight = '10px';
    listContainer.style.flex = '1';

    hundredReasons.forEach((reason, idx) => {
      const item = document.createElement('div');
      item.style.marginBottom = '12px';
      item.style.paddingBottom = '12px';
      item.style.borderBottom = '1px solid rgba(124,73,255,0.08)';
      item.style.fontSize = '0.95rem';
      item.style.lineHeight = '1.5';
      
      const num = document.createElement('span');
      num.style.fontWeight = '600';
      num.style.color = '#7c49ff';
      num.textContent = `${idx + 1}. `;
      
      const text = document.createElement('span');
      text.textContent = reason;
      
      item.appendChild(num);
      item.appendChild(text);
      listContainer.appendChild(item);
    });

    // La razón por la que no soy feliz contigo
    const negativeReason = document.createElement('div');
    negativeReason.style.marginTop = '20px';
    negativeReason.style.paddingTop = '16px';
    negativeReason.style.borderTop = '2px solid rgba(255,111,191,0.2)';
    negativeReason.style.fontSize = '0.95rem';
    negativeReason.style.lineHeight = '1.5';
    negativeReason.style.textAlign = 'center';
    negativeReason.style.fontStyle = 'italic';
    negativeReason.style.color = '#5d4860';
    
    const negNum = document.createElement('span');
    negNum.style.fontWeight = '600';
    negNum.style.color = '#ff6fbf';
    negNum.textContent = '✗ ';
    
    const negText = document.createElement('span');
    negText.textContent = 'La razón por la que no: que no estés aquí a mi ladito.';
    
    negativeReason.appendChild(negNum);
    negativeReason.appendChild(negText);
    listContainer.appendChild(negativeReason);

    card.appendChild(listContainer);

    const close = document.createElement('button');
    close.textContent = 'Cerrar';
    close.className = 'btn small';
    close.style.marginTop = '16px';
    close.style.alignSelf = 'center';
    close.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    card.appendChild(close);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // confetti
    runTinyConfetti();
  }

  // --- Button to show 100 reasons ---
  if (btnRandomBday) {
    btnRandomBday.addEventListener('click', () => {
      show100ReasonsModal();
    });
  }

  // --- Print action ---
  if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
  }

  // --- Song URL save ---
  if (typeof btnSetSong !== 'undefined' && btnSetSong) {
    btnSetSong.addEventListener('click', () => {
      const url = (typeof songUrlInput !== 'undefined' && songUrlInput) ? songUrlInput.value.trim() : '';
      if (!url) {
        if (typeof songFeedback !== 'undefined' && songFeedback) {
          songFeedback.textContent = 'Introduce un enlace válido para guardar.';
          setTimeout(() => songFeedback.textContent = '', 2500);
        }
        return;
      }
      localStorage.setItem('songForHer', url);
      if (typeof songFeedback !== 'undefined' && songFeedback) {
        songFeedback.textContent = 'Enlace guardado. Puedes abrirlo desde el navegador cuando quieras.';
        setTimeout(() => songFeedback.textContent = '', 2800);
      }
    });
  }

  // --- Popup for showing a prominent message ---
  function showPopup(text) {
    // crear overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = 0;
    overlay.style.background = 'rgba(20,10,30,0.45)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;

    const card = document.createElement('div');
    card.style.maxWidth = '720px';
    card.style.width = '92%';
    card.style.padding = '26px';
    card.style.borderRadius = '16px';
    card.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.9))';
    card.style.boxShadow = '0 18px 60px rgba(36,19,50,0.4)';
    card.style.textAlign = 'center';
    card.style.color = '#331c3f';

    const h = document.createElement('h2');
    h.textContent = 'Un mensaje para ti';
    h.style.margin = '0 0 12px 0';
    h.style.fontSize = '1.4rem';
    h.style.fontFamily = 'Sacramento, Poppins, serif';
    card.appendChild(h);

    const p = document.createElement('p');
    p.textContent = text;
    p.style.fontSize = '1.05rem';
    p.style.margin = '0 0 18px 0';
    card.appendChild(p);

    const close = document.createElement('button');
    close.textContent = 'Cerrar';
    close.className = 'btn small';
    close.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    card.appendChild(close);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // efecto tipo confetti sencillo
    runTinyConfetti();
  }

  // --- Pequeño confetti hecho con DOM (sin librerías) ---
  function runTinyConfetti(){
    const n = 28;
    for (let i = 0; i < n; i++){
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.left = (50 + (Math.random() * 600 - 300)) + 'px';
      el.style.top = '-10px';
      el.style.width = (6 + Math.random() * 8) + 'px';
      el.style.height = (10 + Math.random() * 14) + 'px';
      el.style.opacity = 0.95;
      el.style.borderRadius = '2px';
      el.style.zIndex = 10000;
      el.style.transform = `rotate(${Math.random()*360}deg)`;
      el.style.background = Math.random() > 0.5 ? '#ff6fbf' : '#7c49ff';
      document.body.appendChild(el);

      const fallTime = 1200 + Math.random() * 1600;
      const endLeft = (parseFloat(el.style.left) + (Math.random() * 220 - 110));
      el.animate([
        { transform: el.style.transform, top: '-10px', left: el.style.left, opacity: 1 },
        { transform: `rotate(${Math.random()*720}deg)`, top: (window.innerHeight + 40) + 'px', left: endLeft + 'px', opacity: 0.85 }
      ], { duration: fallTime, easing: 'cubic-bezier(.2,.8,.2,1)'});

      // cleanup
      setTimeout(() => { try{ document.body.removeChild(el); }catch(e){} }, fallTime + 200);
    }
  }

  // --- Inicialización final: una sorpresa visual inicial ---
  // --- Print gallery: simple photo viewer that cycles on click, loads from img/
  (function initPrintGallery(){
    const placeholders = [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="100%" height="100%" fill="%23ff6fbf"/><text x="50%" y="50%" fill="%23fff" font-size="48" font-family="Poppins" dominant-baseline="middle" text-anchor="middle">Galería vacía</text></svg>'
    ];

    const frame = document.getElementById('photo-frame');
    if (!frame) return;

    // Rutas relativas y consistentes (sin slash inicial). Usamos los nombres tal como los tienes.
    const sourceList = [
      'img/img 2.jpg',
      'img/img 3.jpg',
      'img/img 4.jpg',
      'img/img 5.jpg',
      'img/img 6.jpg',
      'img/img 7.jpg',
      'img/img 8.jpg',
      'img/img 9.jpg',
      'img/img 10.jpg',
      'img/img 11.jpg',
      'img/img 12.jpg',
      'img/img 13.jpg',
      'img/img 14.jpg',
      'img/img 15.jpg',
      'img/img 16.jpg',
      'img/img 17.jpg',
      'img/img 18.jpg',
      'img/img 19.jpg',
      'img/img 20.jpg',
      'img/miniña.jpg'
    ];

    let idx = 0;
    const imgs = sourceList.map((src,i)=>{
      const img = document.createElement('img');

      // encodeURI maneja espacios y caracteres como ñ
      img.src = encodeURI(src);
      img.alt = `Foto ${i+1}`;
      img.tabIndex = 0;
      if (i !== 0) img.classList.add('hidden');

      // Si falla la carga, sustituimos por placeholder y registramos la ruta que falló
      img.onerror = () => {
        console.warn('Galería: error cargando imagen', src);
        img.src = placeholders[0];
        img.classList.remove('hidden');
        img.setAttribute('data-errored', 'true');
      };

      frame.appendChild(img);
      return img;
    });

    function showIndex(n){
      idx = ((n % imgs.length) + imgs.length) % imgs.length;
      imgs.forEach((im,i)=> im.classList.toggle('hidden', i !== idx));
    }

    function next(){ showIndex(idx+1); }

    frame.addEventListener('click', next);
    frame.addEventListener('keydown', (e)=>{ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } });

    // Si ninguna imagen real cargó en 1s, mostramos placeholder en su lugar (más visible)
    setTimeout(()=>{
      const allErrored = imgs.length && imgs.every(i => i.getAttribute('data-errored') === 'true' || (i.naturalWidth === 0 && i.complete));
      if (allErrored) {
        frame.innerHTML = '';
        const ph = document.createElement('img');
        ph.src = placeholders[0];
        ph.alt = 'Galería vacía';
        frame.appendChild(ph);
      }
    }, 1000);

    // EXPAND: botón para ver la imagen en pantalla completa
    const expandBtn = document.getElementById('photo-expand');
    function openOverlay(startIndex){
      const overlay = document.createElement('div');
      overlay.className = 'photo-overlay';

      const bigImg = document.createElement('img');
      bigImg.src = imgs[startIndex] ? imgs[startIndex].src : placeholders[0];
      bigImg.alt = imgs[startIndex] ? imgs[startIndex].alt : 'Foto';

      const close = document.createElement('button');
      close.className = 'close-btn';
      close.textContent = 'Cerrar';

      const prev = document.createElement('button');
      prev.className = 'nav-btn prev';
      prev.innerHTML = '◀';
      const nextBtn = document.createElement('button');
      nextBtn.className = 'nav-btn next';
      nextBtn.innerHTML = '▶';

      overlay.appendChild(prev);
      overlay.appendChild(nextBtn);
      overlay.appendChild(bigImg);
      overlay.appendChild(close);
      document.body.appendChild(overlay);

      let cur = startIndex;
      function showBig(i){
        cur = ((i % imgs.length) + imgs.length) % imgs.length;
        bigImg.src = imgs[cur] ? imgs[cur].src : placeholders[0];
      }

      function onKey(e){
        if (e.key === 'Escape') { cleanup(); }
        if (e.key === 'ArrowLeft') { showBig(cur-1); }
        if (e.key === 'ArrowRight') { showBig(cur+1); }
      }

      function cleanup(){
        document.removeEventListener('keydown', onKey);
        try{ document.body.removeChild(overlay); }catch(e){}
      }

      prev.addEventListener('click', ()=> showBig(cur-1));
      nextBtn.addEventListener('click', ()=> showBig(cur+1));
      close.addEventListener('click', cleanup);
      overlay.addEventListener('click', (ev)=>{ if (ev.target === overlay) cleanup(); });
      document.addEventListener('keydown', onKey);
    }

    if (expandBtn) {
      expandBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        openOverlay(idx);
      });
    }
  })();

  // --- Inicialización final: una sorpresa visual inicial ---
  setTimeout(() => {
    // pequeña animación de entrada en título
    const t = document.querySelector('.title');
    t.animate([{ transform: 'translateY(12px)', opacity:0 }, { transform: 'translateY(0)', opacity:1 }], { duration:700, easing:'cubic-bezier(.2,.9,.2,1)' });
  }, 300);
});
