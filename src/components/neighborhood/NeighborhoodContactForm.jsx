import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useNeighborhoodTracking } from '@/hooks/useNeighborhoodTracking';
import { Loader2, Mail } from 'lucide-react';

const NeighborhoodContactForm = ({ neighborhoodData }) => {
    const { trackFormSubmit } = useNeighborhoodTracking(neighborhoodData);
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!neighborhoodData) return;

        setLoading(true);

        try {
            // 1. Track Event
            trackFormSubmit(formData.email, formData.phone);

            // 2. Save to Supabase
            const { error } = await supabase.from('contacts').insert({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: `[Interesse em Bairro: ${neighborhoodData.name}] ${formData.message}`
            });

            if (error) throw error;

            toast({
                title: "Solicitação enviada!",
                description: "Nossos especialistas entrarão em contato em breve.",
                className: "bg-green-50 border-green-200"
            });

            setFormData({ name: '', email: '', phone: '', message: '' });

        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao enviar",
                description: "Tente novamente mais tarde ou use o WhatsApp.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#1a3a52] rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/10 rounded-full">
                    <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Oportunidades Exclusivas</h3>
                    <p className="text-blue-200 text-sm">Receba alertas de imóveis em {neighborhoodData?.name}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    name="name" 
                    placeholder="Seu Nome" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-white focus:ring-white"
                />
                <Input 
                    name="email" 
                    type="email" 
                    placeholder="Seu Melhor E-mail" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-white focus:ring-white"
                />
                <Input 
                    name="phone" 
                    type="tel" 
                    placeholder="Telefone / WhatsApp" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    required 
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-white focus:ring-white"
                />
                <Textarea 
                    name="message" 
                    placeholder="O que você procura?" 
                    value={formData.message} 
                    onChange={handleChange} 
                    rows={3} 
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-white focus:ring-white resize-none"
                />
                
                <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#ff8c42] hover:bg-[#e67a30] text-white font-bold h-12 text-lg shadow-lg mt-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Receber Oportunidades"}
                </Button>
                
                <p className="text-xs text-center text-blue-200/60 mt-4">
                    Seus dados estão seguros. Não enviamos spam.
                </p>
            </form>
        </div>
    );
};

export default NeighborhoodContactForm;