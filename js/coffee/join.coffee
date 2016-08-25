join = (S, L) ->
    L.reduce ((A,x,i,l) -> if i==0 then x else A + S + x), ""

window.join = join