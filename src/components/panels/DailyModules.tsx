import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const CURATED_WORDS = [
  { word: 'leverage', phonetic: '/ˈlɛvərɪdʒ/', partOfSpeech: 'noun', definition: 'The power to influence a person or situation to achieve a particular outcome.', example: 'Use your leverage wisely in negotiations.' },
  { word: 'resilience', phonetic: '/rɪˈzɪliəns/', partOfSpeech: 'noun', definition: 'The capacity to withstand or to recover quickly from difficulties.', example: 'Her resilience in the face of adversity was remarkable.' },
  { word: 'catalyst', phonetic: '/ˈkætəlɪst/', partOfSpeech: 'noun', definition: 'A person or thing that precipitates an event or change.', example: 'The new policy was a catalyst for economic growth.' },
  { word: 'tenacity', phonetic: '/tɪˈnæsɪti/', partOfSpeech: 'noun', definition: 'The quality of being very determined; persistence.', example: 'His tenacity in pursuit of the goal paid off.' },
  { word: 'pragmatic', phonetic: '/præɡˈmætɪk/', partOfSpeech: 'adjective', definition: 'Dealing with things sensibly and realistically.', example: 'She took a pragmatic approach to solving the problem.' },
  { word: 'iterate', phonetic: '/ˈɪtəreɪt/', partOfSpeech: 'verb', definition: 'To perform or utter repeatedly; to refine through repetition.', example: 'We need to iterate on this design before launch.' },
  { word: 'synergy', phonetic: '/ˈsɪnərdʒi/', partOfSpeech: 'noun', definition: 'The interaction of two or more elements to produce a combined effect greater than the sum of their parts.', example: 'The synergy between the teams led to breakthrough results.' },
  { word: 'acumen', phonetic: '/əˈkjuːmən/', partOfSpeech: 'noun', definition: 'The ability to make good judgments and quick decisions.', example: 'Her business acumen was evident in every deal she closed.' },
  { word: 'velocity', phonetic: '/vəˈlɒsɪti/', partOfSpeech: 'noun', definition: 'The speed at which something moves or operates.', example: 'The team increased their development velocity this quarter.' },
  { word: 'fortitude', phonetic: '/ˈfɔːrtɪtjuːd/', partOfSpeech: 'noun', definition: 'Courage in pain or adversity; mental strength.', example: 'It takes fortitude to build something from nothing.' },
  { word: 'paradigm', phonetic: '/ˈpærədaɪm/', partOfSpeech: 'noun', definition: 'A typical example or pattern of something; a model.', example: 'The new technology represents a paradigm shift in computing.' },
  { word: 'calibrate', phonetic: '/ˈkælɪbreɪt/', partOfSpeech: 'verb', definition: 'To adjust precisely for a particular function.', example: 'Calibrate your approach based on the data.' },
  { word: 'momentum', phonetic: '/moʊˈmɛntəm/', partOfSpeech: 'noun', definition: 'The impetus gained by a moving object or process.', example: 'Do not lose momentum — keep shipping.' },
  { word: 'arbitrage', phonetic: '/ˈɑːrbɪtrɑːʒ/', partOfSpeech: 'noun', definition: 'The exploitation of price differences in different markets.', example: 'He found an arbitrage opportunity between the two platforms.' },
  { word: 'converge', phonetic: '/kənˈvɜːrdʒ/', partOfSpeech: 'verb', definition: 'To come together from different directions to eventually meet.', example: 'All our efforts converge toward this single goal.' },
  { word: 'inflection', phonetic: '/ɪnˈflɛkʃən/', partOfSpeech: 'noun', definition: 'A point of change; a turning point.', example: 'The company reached an inflection point in its growth.' },
  { word: 'antifragile', phonetic: '/ˌæntɪˈfrædʒaɪl/', partOfSpeech: 'adjective', definition: 'Becoming stronger or more capable when exposed to stressors or volatility.', example: 'An antifragile system thrives under pressure.' },
  { word: 'scaffold', phonetic: '/ˈskæfəld/', partOfSpeech: 'verb', definition: 'To provide a temporary framework to support something being built.', example: 'Scaffold the project first, then fill in the details.' },
  { word: 'entropy', phonetic: '/ˈɛntrəpi/', partOfSpeech: 'noun', definition: 'A gradual decline into disorder; lack of order or predictability.', example: 'Without maintenance, systems tend toward entropy.' },
  { word: 'cadence', phonetic: '/ˈkeɪdəns/', partOfSpeech: 'noun', definition: 'A rhythmic sequence or flow of events.', example: 'Establish a weekly cadence for reviews.' },
  { word: 'asymmetry', phonetic: '/eɪˈsɪmɪtri/', partOfSpeech: 'noun', definition: 'Lack of equality or equivalence between parts.', example: 'Seek asymmetric bets — limited downside, unlimited upside.' },
  { word: 'heuristic', phonetic: '/hjʊˈrɪstɪk/', partOfSpeech: 'noun', definition: 'A practical approach to problem-solving that is not guaranteed to be optimal but is sufficient for reaching an immediate goal.', example: 'Use this heuristic to make faster decisions.' },
  { word: 'compounding', phonetic: '/kəmˈpaʊndɪŋ/', partOfSpeech: 'noun', definition: 'The process by which growth accelerates over time as returns generate further returns.', example: 'Compounding is the eighth wonder of the world.' },
  { word: 'sovereign', phonetic: '/ˈsɒvrɪn/', partOfSpeech: 'adjective', definition: 'Possessing supreme or ultimate power; self-governing.', example: 'Be sovereign over your time and decisions.' },
  { word: 'optionality', phonetic: '/ˌɒpʃəˈnælɪti/', partOfSpeech: 'noun', definition: 'The value of having choices or alternatives available.', example: 'Build optionality into every plan.' },
  { word: 'deliberate', phonetic: '/dɪˈlɪbərɪt/', partOfSpeech: 'adjective', definition: 'Done consciously and intentionally.', example: 'Deliberate practice leads to mastery.' },
  { word: 'amplitude', phonetic: '/ˈæmplɪtjuːd/', partOfSpeech: 'noun', definition: 'The maximum extent or magnitude of something.', example: 'Increase the amplitude of your efforts when it counts.' },
  { word: 'confluence', phonetic: '/ˈkɒnfluəns/', partOfSpeech: 'noun', definition: 'A coming together of two or more things.', example: 'Success comes at the confluence of preparation and opportunity.' },
  { word: 'nascent', phonetic: '/ˈnæsənt/', partOfSpeech: 'adjective', definition: 'Just coming into existence and beginning to display signs of future potential.', example: 'The nascent project showed enormous promise.' },
  { word: 'threshold', phonetic: '/ˈθrɛʃhoʊld/', partOfSpeech: 'noun', definition: 'The point at which a stimulus is strong enough to produce an effect; a starting point.', example: 'You are at the threshold of something great.' },
  { word: 'equilibrium', phonetic: '/ˌiːkwɪˈlɪbriəm/', partOfSpeech: 'noun', definition: 'A state in which opposing forces are balanced.', example: 'Find equilibrium between ambition and well-being.' },
  { word: 'substrate', phonetic: '/ˈsʌbstreɪt/', partOfSpeech: 'noun', definition: 'An underlying substance or layer; a foundation.', example: 'Build a strong substrate before scaling.' },
  { word: 'precipice', phonetic: '/ˈprɛsɪpɪs/', partOfSpeech: 'noun', definition: 'The brink of a momentous or dangerous situation.', example: 'Standing at the precipice of a major decision.' },
  { word: 'kinetic', phonetic: '/kɪˈnɛtɪk/', partOfSpeech: 'adjective', definition: 'Relating to or resulting from motion; active and dynamic.', example: 'Channel kinetic energy into productive work.' },
  { word: 'aperture', phonetic: '/ˈæpərtʃər/', partOfSpeech: 'noun', definition: 'An opening or gap; the extent of one\'s focus or view.', example: 'Narrow your aperture to focus on what matters most.' },
  { word: 'autonomy', phonetic: '/ɔːˈtɒnəmi/', partOfSpeech: 'noun', definition: 'The right or condition of self-government; freedom from external control.', example: 'Autonomy is the ultimate reward of building your own systems.' },
  { word: 'inertia', phonetic: '/ɪˈnɜːrʃə/', partOfSpeech: 'noun', definition: 'A tendency to do nothing or remain unchanged; resistance to change.', example: 'Overcome inertia with a single decisive action.' },
  { word: 'oscillate', phonetic: '/ˈɒsɪleɪt/', partOfSpeech: 'verb', definition: 'To move or swing back and forth at a regular speed.', example: 'Don\'t oscillate between options — commit and iterate.' },
  { word: 'traction', phonetic: '/ˈtrækʃən/', partOfSpeech: 'noun', definition: 'The extent to which an idea or product gains popularity or acceptance.', example: 'The product is finally gaining traction in the market.' },
  { word: 'synthesis', phonetic: '/ˈsɪnθəsɪs/', partOfSpeech: 'noun', definition: 'The combination of ideas to form a theory or system.', example: 'Great strategy comes from the synthesis of data and intuition.' },
  { word: 'distill', phonetic: '/dɪˈstɪl/', partOfSpeech: 'verb', definition: 'To extract the essential meaning or most important aspects of.', example: 'Distill complex problems down to their core.' },
  { word: 'granular', phonetic: '/ˈɡrænjʊlər/', partOfSpeech: 'adjective', definition: 'Characterized by fine detail; broken into small parts.', example: 'Get granular on the details to find the real issue.' },
  { word: 'flux', phonetic: '/flʌks/', partOfSpeech: 'noun', definition: 'Continuous change; a state of uncertainty.', example: 'Markets are always in flux — stay adaptive.' },
  { word: 'efficacy', phonetic: '/ˈɛfɪkəsi/', partOfSpeech: 'noun', definition: 'The ability to produce a desired or intended result.', example: 'Measure the efficacy of every process you implement.' },
  { word: 'latent', phonetic: '/ˈleɪtənt/', partOfSpeech: 'adjective', definition: 'Existing but not yet developed, manifest, or active.', example: 'Unlock your latent potential through disciplined effort.' },
  { word: 'proxy', phonetic: '/ˈprɒksi/', partOfSpeech: 'noun', definition: 'An indicator or measure used to represent something else.', example: 'Revenue is a proxy for value delivered.' },
  { word: 'recalibrate', phonetic: '/riːˈkælɪbreɪt/', partOfSpeech: 'verb', definition: 'To adjust or correct after an initial assessment.', example: 'Recalibrate your strategy every quarter.' },
  { word: 'substrate', phonetic: '/ˈsʌbstreɪt/', partOfSpeech: 'noun', definition: 'The underlying foundation upon which something is built.', example: 'Every great product needs a solid substrate.' },
  { word: 'volition', phonetic: '/voʊˈlɪʃən/', partOfSpeech: 'noun', definition: 'The faculty or power of using one\'s will.', example: 'Act with volition — choose your path deliberately.' },
  { word: 'zenith', phonetic: '/ˈziːnɪθ/', partOfSpeech: 'noun', definition: 'The highest point; the peak or pinnacle.', example: 'You haven\'t reached your zenith yet. Keep climbing.' }
];

const CURATED_VERSES = [
  { ref: 'Proverbs 16:3', text: 'Commit to the LORD whatever you do, and he will establish your plans.' },
  { ref: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.' },
  { ref: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.' },
  { ref: 'Proverbs 3:5-6', text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
  { ref: 'Isaiah 40:31', text: 'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
  { ref: 'Joshua 1:9', text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.' },
  { ref: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { ref: 'Psalm 37:5', text: 'Commit your way to the LORD; trust in him and he will do this.' },
  { ref: 'Proverbs 13:11', text: 'Dishonest money dwindles away, but whoever gathers money little by little makes it grow.' },
  { ref: 'Ecclesiastes 9:10', text: 'Whatever your hand finds to do, do it with all your might.' },
  { ref: 'Colossians 3:23', text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.' },
  { ref: 'Psalm 90:12', text: 'Teach us to number our days, that we may gain a heart of wisdom.' },
  { ref: 'Proverbs 21:5', text: 'The plans of the diligent lead to profit as surely as haste leads to poverty.' },
  { ref: 'James 1:5', text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.' },
  { ref: 'Psalm 127:1', text: 'Unless the LORD builds the house, the builders labor in vain.' },
  { ref: 'Proverbs 10:4', text: 'Lazy hands make for poverty, but diligent hands bring wealth.' },
  { ref: 'Matthew 6:33', text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.' },
  { ref: 'Galatians 6:9', text: 'Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.' },
  { ref: 'Psalm 37:23-24', text: 'The LORD makes firm the steps of the one who delights in him; though he may stumble, he will not fall, for the LORD upholds him with his hand.' },
  { ref: 'Proverbs 14:23', text: 'All hard work brings a profit, but mere talk leads only to poverty.' },
  { ref: 'Hebrews 12:11', text: 'No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness and peace for those who have been trained by it.' },
  { ref: 'Psalm 119:105', text: 'Your word is a lamp for my feet, a light on my path.' },
  { ref: 'Proverbs 24:27', text: 'Put your outdoor work in order and get your fields ready; after that, build your house.' },
  { ref: '2 Timothy 1:7', text: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.' },
  { ref: 'Psalm 1:3', text: 'That person is like a tree planted by streams of water, which yields its fruit in season and whose leaf does not wither — whatever they do prospers.' },
  { ref: 'Proverbs 11:14', text: 'For lack of guidance a nation falls, but victory is won through many advisers.' },
  { ref: 'Romans 12:11', text: 'Never be lacking in zeal, but keep your spiritual fervor, serving the Lord.' },
  { ref: 'Psalm 46:10', text: 'Be still, and know that I am God.' },
  { ref: 'Proverbs 22:29', text: 'Do you see someone skilled in their work? They will serve before kings; they will not serve before officials of low rank.' },
  { ref: 'Isaiah 41:10', text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.' },
];

import affirmations from '@/data/affirmations.json';

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

async function fetchWordOfDay() {
  const dayIndex = getDayOfYear() % CURATED_WORDS.length;
  const fallback = CURATED_WORDS[dayIndex];
  
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${fallback.word}`);
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    const entry = data[0];
    const meaning = entry.meanings?.[0];
    return {
      word: entry.word,
      phonetic: entry.phonetic || fallback.phonetic,
      partOfSpeech: meaning?.partOfSpeech || fallback.partOfSpeech,
      definition: meaning?.definitions?.[0]?.definition || fallback.definition,
      example: meaning?.definitions?.[0]?.example || fallback.example,
    };
  } catch {
    return fallback;
  }
}

export function DailyModules() {
  const dayIndex = getDayOfYear();

  const { data: wordData, isLoading: wordLoading } = useQuery({
    queryKey: ['word-of-day', dayIndex],
    queryFn: fetchWordOfDay,
    staleTime: 24 * 60 * 60 * 1000,
    refetchInterval: 24 * 60 * 60 * 1000,
  });

  const verse = CURATED_VERSES[dayIndex % CURATED_VERSES.length];
  const affirmation = affirmations[dayIndex % affirmations.length];

  return (
    <div className="space-y-4">
      {/* Word of the Day */}
      <div className="rounded-2xl border card-peach p-5 card-glow">
        <h3 className="font-serif text-sm font-semibold text-foreground/70 mb-3 flex items-center gap-1.5">
          <span className="text-base">📖</span> Word of the Day
        </h3>
        {wordLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : wordData ? (
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="font-serif-bold text-xl text-foreground">{wordData.word}</span>
              <span className="text-xs text-muted-foreground font-mono">{wordData.phonetic}</span>
            </div>
            <p className="text-[10px] text-muted-foreground italic">{wordData.partOfSpeech}</p>
            <p className="text-sm text-foreground leading-relaxed">{wordData.definition}</p>
            {wordData.example && (
              <p className="text-xs text-muted-foreground italic">"{wordData.example}"</p>
            )}
          </div>
        ) : null}
      </div>

      {/* Bible Verse */}
      <div className="rounded-2xl border card-lavender p-5 card-glow">
        <h3 className="font-serif text-sm font-semibold text-foreground/70 mb-3 flex items-center gap-1.5">
          <span className="text-base">✝️</span> Verse of the Day
        </h3>
        <div className="text-center py-2">
          <p className="font-serif font-semibold text-foreground text-sm mb-2">{verse.ref}</p>
          <p className="font-serif text-sm text-foreground leading-relaxed italic">
            &ldquo;{verse.text}&rdquo;
          </p>
        </div>
      </div>

      {/* Affirmation */}
      <div className="rounded-2xl border card-pink p-5 card-glow">
        <h3 className="font-serif text-sm font-semibold text-foreground/70 mb-3 flex items-center gap-1.5">
          <span className="text-base">💫</span> Affirmation
        </h3>
        <p className="font-serif text-lg text-foreground text-center leading-relaxed py-2">
          &ldquo;{affirmation}&rdquo;
        </p>
      </div>
    </div>
  );
}
