// SmartBenchRipple.jsx
// Run from File > Scripts > Run Script File in After Effects
// Generates a Delaunay triangle mesh with freeform ripple control points

(function(thisObj) {

// ─── CONFIG ──────────────────────────────────────────────────────────────────
var CFG = {
    numPoints:    120,    // triangle seed density
    waveSpeed:    300,    // px/sec default
    flashDur:     0.1,    // sec - white flash duration
    fadeDur:      0.4,    // sec - fade to dark duration
    inset:        0.92,   // triangle inset (gap between triangles)
    maxPoints:    10,     // max ripple control points
    bgColor:      [0.02, 0.03, 0.06],
};

// ─── DELAUNAY (Bowyer-Watson) ─────────────────────────────────────────────────
function circumcircle(a, b, c) {
    var ax=a[0],ay=a[1],bx=b[0],by=b[1],cx=c[0],cy=c[1];
    var D = 2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));
    if (Math.abs(D) < 1e-10) return null;
    var aa=ax*ax+ay*ay, bb=bx*bx+by*by, cc=cx*cx+cy*cy;
    var ux=(aa*(by-cy)+bb*(cy-ay)+cc*(ay-by))/D;
    var uy=(aa*(cx-bx)+bb*(ax-cx)+cc*(bx-ax))/D;
    return {x:ux, y:uy, r:Math.sqrt((ax-ux)*(ax-ux)+(ay-uy)*(ay-uy))};
}

function triangulate(points) {
    var M=1e6;
    var sup=[[-M,-M],[M*3,-M],[0,M*3]];
    var n=points.length;
    var all=points.concat(sup);
    var tris=[[n,n+1,n+2]];

    for (var pi=0; pi<n; pi++) {
        var p=points[pi];
        var bad=[], edges=[];
        for (var ti=tris.length-1; ti>=0; ti--) {
            var t=tris[ti];
            var cc=circumcircle(all[t[0]],all[t[1]],all[t[2]]);
            if (!cc) continue;
            var dx=p[0]-cc.x, dy=p[1]-cc.y;
            if (dx*dx+dy*dy < cc.r*cc.r+1e-6) {
                bad.push(ti);
                edges.push([t[0],t[1]],[t[1],t[2]],[t[2],t[0]]);
            }
        }
        var bnd=[];
        for (var ei=0; ei<edges.length; ei++) {
            var e=edges[ei], dup=false;
            for (var ej=0; ej<edges.length; ej++) {
                if (ei===ej) continue;
                var f=edges[ej];
                if((e[0]===f[0]&&e[1]===f[1])||(e[0]===f[1]&&e[1]===f[0])){dup=true;break;}
            }
            if (!dup) bnd.push(e);
        }
        for (var bi=bad.length-1; bi>=0; bi--) tris.splice(bad[bi],1);
        for (var bdi=0; bdi<bnd.length; bdi++) tris.push([bnd[bdi][0],bnd[bdi][1],pi]);
    }

    var result=[];
    for (var ri=0; ri<tris.length; ri++) {
        var t=tris[ri];
        if (t[0]<n && t[1]<n && t[2]<n)
            result.push([all[t[0]],all[t[1]],all[t[2]]]);
    }
    return result;
}

function seedPoints(w, h, n) {
    var pts=[[0,0],[w,0],[0,h],[w,h],
              [w/2,0],[0,h/2],[w,h/2],[w/2,h],
              [w/4,0],[3*w/4,0],[0,h/4],[0,3*h/4],
              [w,h/4],[w,3*h/4],[w/4,h],[3*w/4,h]];
    var cols=Math.round(Math.sqrt(n*w/h));
    var rows=Math.round(n/cols);
    var cw=w/cols, ch=h/rows;
    for (var r=0;r<rows;r++)
        for (var c=0;c<cols;c++)
            pts.push([c*cw+cw*0.15+Math.random()*cw*0.7,
                      r*ch+ch*0.15+Math.random()*ch*0.7]);
    return pts;
}

// ─── EXPRESSION BUILDER ──────────────────────────────────────────────────────
function expr(cx, cy, returnType) {
    // returnType: "opacity" or "color"
    var lines = [
        'var cx='+cx.toFixed(2)+', cy='+cy.toFixed(2)+';',
        'var ctrl=thisComp.layer("RIPPLE_CTRL");',
        'var spd=ctrl.effect("Wave Speed")("Slider");',
        'var fl=ctrl.effect("Flash Dur")("Slider");',
        'var fd=ctrl.effect("Fade Dur")("Slider");',
        'var mb=0;',
        'for(var i=1;i<='+CFG.maxPoints+';i++){',
        '  try{',
        '    var pt=thisComp.layer("RipplePoint_"+i);',
        '    if(pt.effect("Active")("Slider")<0.5) continue;',
        '    var pp=pt.transform.position;',
        '    var rad=pt.effect("Radius")("Slider");',
        '    var st=pt.effect("Start Time")("Slider");',
        '    var dx=pp[0]-cx, dy=pp[1]-cy;',
        '    var d=Math.sqrt(dx*dx+dy*dy);',
        '    var adj=Math.max(0,d-rad);',
        '    var t=time-st-(adj/spd);',
        '    var b=0;',
        '    if(t>=0&&t<fl){b=1;}',
        '    else if(t>=fl){b=Math.max(0,1-(t-fl)/fd);}',
        '    if(b>mb)mb=b;',
        '  }catch(e){}',
        '}',
    ];
    if (returnType === "opacity") {
        lines.push('mb*92;');
    } else {
        lines.push('var r=0.12+0.88*mb;');
        lines.push('var g=0.16+0.84*mb;');
        lines.push('var b=0.24+0.76*mb;');
        lines.push('[r,g,b,Math.min(mb*1.1,0.92)];');
    }
    return lines.join('\n');
}

// ─── CONTROL LAYER ───────────────────────────────────────────────────────────
function makeCtrl(comp) {
    var c=comp.layers.addNull(comp.duration);
    c.name="RIPPLE_CTRL";
    c.label=14;
    c.shy=true;
    function sl(name, val, min, max) {
        var e=c.property("Effects").addProperty("ADBE Slider Control");
        e.name=name;
        var s=e.property("Slider");
        s.setValue(val);
        return s;
    }
    sl("Wave Speed", CFG.waveSpeed);
    sl("Flash Dur",  CFG.flashDur);
    sl("Fade Dur",   CFG.fadeDur);
    return c;
}

// ─── RIPPLE POINT ────────────────────────────────────────────────────────────
function makePoint(comp, idx) {
    var pt=comp.layers.addNull(comp.duration);
    pt.name="RipplePoint_"+idx;
    pt.label=3;
    pt.transform.position.setValue([comp.width/2, comp.height/2]);

    function sl(name, val) {
        var e=pt.property("Effects").addProperty("ADBE Slider Control");
        e.name=name; e.property("Slider").setValue(val);
    }
    sl("Radius",     60);   // px - contact area radius
    sl("Start Time", 1.0);  // sec - when ripple fires
    sl("Active",     1);    // 1=on 0=off
    return pt;
}

// ─── GENERATE MESH ───────────────────────────────────────────────────────────
function generate(comp, n) {
    var w=comp.width, h=comp.height;
    var ox=-w/2, oy=-h/2;   // offset: layer pos is comp center

    // Background
    var bg=comp.layers.addSolid(CFG.bgColor,"Background",w,h,1,comp.duration);
    bg.moveToEnd();

    // Control + first point
    makeCtrl(comp);
    makePoint(comp, 1);

    // Triangulate
    var pts=seedPoints(w,h,n);
    var tris=triangulate(pts);

    // Progress
    var pw=new Window("palette","Generating mesh...",undefined);
    var pb=pw.add("progressbar",undefined,0,tris.length);
    pb.preferredSize.width=280;
    pw.show();

    for (var i=0; i<tris.length; i++) {
        if (i%20===0){ pb.value=i; pw.update(); }
        var t=tris[i];
        var p0=t[0],p1=t[1],p2=t[2];
        var cx=(p0[0]+p1[0]+p2[0])/3;
        var cy=(p0[1]+p1[1]+p2[1])/3;
        var sc=CFG.inset;
        // inset + offset to layer space
        var ax=ox+cx+(p0[0]-cx)*sc, ay=oy+cy+(p0[1]-cy)*sc;
        var bx=ox+cx+(p1[0]-cx)*sc, by=oy+cy+(p1[1]-cy)*sc;
        var dx=ox+cx+(p2[0]-cx)*sc, dy=oy+cy+(p2[1]-cy)*sc;

        var sl=comp.layers.addShape();
        sl.name="tri_"+i;
        sl.label=1;

        var grp=sl.property("Contents").addProperty("ADBE Vector Group");
        grp.name="S";

        // Path
        var pg=grp.property("Contents").addProperty("ADBE Vector Shape - Group");
        var sh=new Shape();
        sh.vertices=[[ax,ay],[bx,by],[dx,dy]];
        sh.inTangents=[[0,0],[0,0],[0,0]];
        sh.outTangents=[[0,0],[0,0],[0,0]];
        sh.closed=true;
        pg.property("Path").setValue(sh);

        // Fill
        var fill=grp.property("Contents").addProperty("ADBE Vector Graphic - Fill");
        fill.property("Color").setValue([0.12,0.16,0.24,0.07]);
        fill.property("Color").expression=expr(cx,cy,"color");

        // Stroke
        var strk=grp.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
        strk.property("Color").setValue([0.14,0.25,0.39,1]);
        strk.property("Stroke Width").setValue(0.6);

        // Layer opacity
        sl.transform.opacity.setValue(7);
        sl.transform.opacity.expression=expr(cx,cy,"opacity");
        sl.moveToEnd();
    }

    pw.close();
    alert("Done. "+tris.length+" triangles.\n\n"+
          "RIPPLE_CTRL — global wave speed, flash, fade\n"+
          "RipplePoint_1 — drag to set contact location\n"+
          "  Radius → contact area size\n"+
          "  Start Time → keyframe this to trigger\n"+
          "  Active → toggle on/off\n\n"+
          "Add more points with Add Ripple Point button.");
}

// ─── SCRIPTUI ────────────────────────────────────────────────────────────────
function buildUI(host) {
    var win=(host instanceof Panel)?host:new Window("palette","Smart Bench Ripple",undefined,{resizeable:true});
    win.orientation="column";
    win.alignChildren=["fill","top"];
    win.spacing=8;
    win.margins=12;

    win.add("statictext",undefined,"Smart Bench Ripple Tool").alignment=["center","top"];
    win.add("panel");

    // Triangle density
    var g1=win.add("group");
    g1.add("statictext",undefined,"Triangles:");
    var sl=g1.add("slider",undefined,120,60,280);
    var tv=g1.add("edittext",undefined,"120");
    tv.preferredSize.width=36;
    sl.onChanging=function(){ tv.text=Math.round(sl.value); };

    // Generate
    var genBtn=win.add("button",undefined,"Generate Mesh");
    genBtn.onClick=function(){
        var c=app.project.activeItem;
        if(!c||!(c instanceof CompItem)){alert("Select a comp first.");return;}
        app.beginUndoGroup("SB Generate");
        generate(c,Math.round(sl.value));
        app.endUndoGroup();
    };

    win.add("panel");

    // Add point
    var addBtn=win.add("button",undefined,"+ Add Ripple Point");
    addBtn.onClick=function(){
        var c=app.project.activeItem;
        if(!c||!(c instanceof CompItem)){alert("Select a comp first.");return;}
        var idx=1;
        while(true){
            try{ c.layer("RipplePoint_"+idx); idx++; }
            catch(e){ break; }
        }
        if(idx>CFG.maxPoints){alert("Max "+CFG.maxPoints+" points.");return;}
        app.beginUndoGroup("SB Add Point");
        makePoint(c,idx);
        app.endUndoGroup();
        alert("Added RipplePoint_"+idx+"\nDrag it in the comp to set contact position.\nAdjust Radius for contact area size.");
    };

    win.add("panel");

    // Instructions
    win.add("statictext",undefined,
        "How to use:\n"+
        "1. Select your comp\n"+
        "2. Click Generate Mesh\n"+
        "3. Drag RipplePoint nulls\n"+
        "4. Radius = contact area size\n"+
        "   (small = finger, large = back)\n"+
        "5. Keyframe Start Time to fire\n"+
        "6. Add points for multi-touch",
        {multiline:true}
    );

    if(win instanceof Window){ win.center(); win.show(); }
    else { win.layout.layout(true); }
    return win;
}

buildUI(thisObj);

}(this));