"""usage: spec2hits.py spec.json hits.json : SFX Kit hits from the scene spec"""
import json, sys
spec = json.load(open(sys.argv[1]))
hits = []
for i, s in enumerate(spec['scenes']):
    if i: hits.append([round(s['a'] + 0.03, 2), 'whoosh-fast-soft'])
    ty = s['type']
    if ty == 'hook': hits.append([s['at'] + 0.05, 'impact-light-firm'])
    elif ty == 'rows':
        for k, it in enumerate(s['items']): hits.append([it['at'] + 0.05, f'tone-step-{k + 1}' if k < 5 else 'pop-small-in'])
    elif ty == 'timeline':
        for k, it in enumerate(s['items']): hits.append([it['at'] + 0.05, f'tone-step-{k % 5 + 1}'])
    elif ty == 'versus':
        hits += [[s['left']['at'] + 0.05, 'pop-small-in'], [s['right']['at'] + 0.05, 'pop-small-in']]
        if s.get('symAt'): hits.append([s['symAt'] + 0.05, 'pop-medium-in'])
    elif ty == 'big':
        hits.append([s['at'] + 0.05, 'pop-medium-in'])
        if s.get('box'): hits.append([s['box'][1] + 0.05, 'impact-medium-soft'])
        if s.get('strike'): hits.append([s['strike'][1] + 0.1, 'swish-medium'])
    elif ty == 'cta': hits.append([s['at'] + 0.05, 'pop-medium-in'])
hits.sort(); json.dump(hits, open(sys.argv[2], 'w')); print('hits', len(hits))
