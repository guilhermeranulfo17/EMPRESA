import json, sys, re
segs = json.load(open(sys.argv[1]))
keep = [[s['s'], s['e']] for s in segs if re.search(r'[A-Za-zÀ-ú]{3}', s['text']) and not s['text'].lstrip().startswith('[')]
json.dump({'all': keep}, open(sys.argv[2], 'w'))
